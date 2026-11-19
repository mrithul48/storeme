// apps/backend/src/modules/subscriptions/subscriptions.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../database/redis.service';
import { PlanEnforcementService } from '../plan-enforcement/plan-enforcement.service';
import { AdminService } from '../admin/admin.service';
import { SubscriptionsRepository } from './repositories/subscriptions.repository';
import {
  SubscriptionCheckoutDto,
  SubscriptionVerifyDto,
  CancelSubscriptionDto,
} from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly subsRepo: SubscriptionsRepository,
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
    private readonly planEnforcementService: PlanEnforcementService,
    private readonly adminService: AdminService,
  ) {}

  /**
   * Helper: verify Razorpay payment HMAC signature
   */
  private verifyRazorpayHmac(orderId: string, paymentId: string, signature: string): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      // In dev / test bypass when testing without real keys
      return true;
    }
    const generated = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generated === signature;
  }

  /**
   * Get merchant's current subscription, plan, and usage against limits
   */
  async getCurrentSubscription(storeId: string) {
    const subscription = await this.subsRepo.findStoreWithSubscriptionAndPlan(storeId);
    const limits = await this.planEnforcementService.getStoreLimitsSummary(storeId);

    // Fetch payment history for this subscription
    const payments = subscription
      ? await this.subsRepo.findPaymentsBySubscriptionId(subscription.id, 10)
      : [];

    return {
      success: true,
      data: {
        subscription,
        limits,
        payments: payments.map((p) => ({
          id: p.id,
          amount: Number(p.amount),
          currency: p.currency,
          status: p.status,
          razorpayPaymentId: p.razorpayPaymentId,
          createdAt: p.createdAt,
        })),
      },
    };
  }

  /**
   * Initiate Razorpay checkout order for subscription upgrade/change
   */
  async initiateCheckout(storeId: string, dto: SubscriptionCheckoutDto) {
    const store = await this.subsRepo.findStoreWithOwner(storeId);

    if (!store) {
      throw new NotFoundException(`Store with ID '${storeId}' not found`);
    }

    const plan = await this.subsRepo.findActivePlanById(dto.planId);

    if (!plan) {
      throw new BadRequestException('Selected plan is not available or inactive');
    }

    const period = dto.billingPeriod || 'YEARLY';
    const amountInRupees =
      period === 'MONTHLY'
        ? Number(plan.price)
        : plan.yearlyPrice
        ? Number(plan.yearlyPrice)
        : Math.round(Number(plan.price) * 12 * 0.8);

    // Razorpay requires amount in paise
    const amountInPaise = Math.round(amountInRupees * 100);

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_e2e_key';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrderId = `sub_order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Call real Razorpay API if credentials exist
    if (keyId && keySecret && !keyId.includes('test_e2e')) {
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `sub_${store.slug}_${Date.now()}`,
            notes: {
              storeId: store.id,
              planId: plan.id,
              planName: plan.name,
              billingPeriod: period,
              type: 'SUBSCRIPTION',
            },
          }),
        });

        if (res.ok) {
          const data: any = await res.json();
          razorpayOrderId = data.id;
        }
      } catch (err: any) {
        this.logger.warn(`Razorpay order API call fallback: ${err.message}`);
      }
    }

    return {
      success: true,
      data: {
        orderId: razorpayOrderId,
        amount: amountInPaise,
        amountInRupees,
        currency: 'INR',
        keyId,
        billingPeriod: period,
        plan: {
          id: plan.id,
          name: plan.name,
          slug: plan.slug,
          price: Number(plan.price),
          yearlyPrice: plan.yearlyPrice ? Number(plan.yearlyPrice) : null,
        },
        merchant: {
          name: store.owner_name,
          email: store.owner_email,
          storeName: store.name,
        },
      },
    };
  }

  /**
   * Verify Razorpay payment and activate / upgrade subscription
   */
  async verifyPayment(
    storeId: string,
    dto: SubscriptionVerifyDto,
    user: { id: string; email: string },
    ip?: string,
  ) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planId } = dto;
    const period = dto.billingPeriod || 'YEARLY';

    // 1. Validate signature
    const isValid = this.verifyRazorpayHmac(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    const store = await this.subsRepo.findStoreWithOwner(storeId);
    if (!store) {
      throw new NotFoundException(`Store with ID '${storeId}' not found`);
    }

    const plan = await this.subsRepo.findPlanById(planId);
    if (!plan) {
      throw new NotFoundException(`Plan with ID '${planId}' not found`);
    }

    const now = new Date();
    const periodEnd = new Date(now);
    if (period === 'MONTHLY') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const amountInRupees =
      period === 'MONTHLY'
        ? Number(plan.price)
        : plan.yearlyPrice
        ? Number(plan.yearlyPrice)
        : Math.round(Number(plan.price) * 12 * 0.8);

    // 2. Perform atomic database updates inside transaction
    const result = await this.db.withTransaction(async (client) => {
      const subscription = await this.subsRepo.upsertSubscription(client, {
        storeId,
        planId: plan.id,
        status: 'ACTIVE',
        billingPeriod: period,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        cancelledAt: null,
        razorpayPaymentId,
      });

      // Record payment transaction
      const payment = await this.subsRepo.createPayment(client, {
        subscriptionId: subscription.id,
        amount: amountInRupees,
        currency: 'INR',
        status: 'PAID',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        metadata: {
          planId: plan.id,
          planName: plan.name,
          billingPeriod: period,
        },
      });

      return { subscription, payment };
    });

    // 3. Log audit event
    await this.adminService.logAction(
      user.id,
      user.email,
      'SUBSCRIPTION_UPGRADE',
      'SUBSCRIPTION',
      result.subscription.id,
      {
        planName: plan.name,
        period,
        amount: amountInRupees,
        paymentId: razorpayPaymentId,
      },
      ip,
    );

    return {
      success: true,
      message: `Successfully upgraded to ${plan.name} (${period.toLowerCase()})`,
      data: {
        subscription: result.subscription,
        payment: result.payment,
      },
    };
  }

  /**
   * Cancel merchant subscription (active until period end)
   */
  async cancelSubscription(
    storeId: string,
    dto: CancelSubscriptionDto,
    user: { id: string; email: string },
    ip?: string,
  ) {
    const sub = await this.subsRepo.findStoreWithSubscriptionAndPlan(storeId);

    if (!sub) {
      throw new NotFoundException('No active subscription found to cancel');
    }

    const updated = await this.subsRepo.cancelSubscription(storeId);

    await this.adminService.logAction(
      user.id,
      user.email,
      'SUBSCRIPTION_CANCEL',
      'SUBSCRIPTION',
      sub.id,
      { reason: dto.reason || 'User requested cancellation', periodEnd: sub.currentPeriodEnd },
      ip,
    );

    return {
      success: true,
      message: 'Subscription has been cancelled. You retain full access until the end of your billing cycle.',
      data: updated,
    };
  }

  /**
   * Idempotent Razorpay Webhook Handler
   */
  async handleWebhook(rawBody: string, signature: string | null) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      if (expected !== signature) {
        throw new BadRequestException('Invalid webhook signature');
      }
    }

    const event = JSON.parse(rawBody);
    const eventId = event.id || event.payload?.payment?.entity?.id || `evt_${Date.now()}`;
    const redisKey = `sub:webhook:${eventId}`;

    // Redis SET NX idempotency check (24 hour TTL)
    const setOk = await this.redis.set(redisKey, '1', 'EX', 86400, 'NX');
    if (!setOk) {
      this.logger.log(`Ignoring duplicate webhook event: ${eventId}`);
      return { success: true, duplicate: true, received: true };
    }

    const eventType = event.event;
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = event.payload?.payment?.entity;
      const notes = paymentEntity?.notes || {};

      if (notes.type === 'SUBSCRIPTION' && notes.storeId && notes.planId) {
        const { storeId, planId, billingPeriod = 'YEARLY' } = notes;
        const plan = await this.subsRepo.findPlanById(planId);

        if (plan) {
          const now = new Date();
          const periodEnd = new Date(now);
          if (billingPeriod === 'MONTHLY') {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
          } else {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          }

          const amount = paymentEntity.amount ? paymentEntity.amount / 100 : Number(plan.price);

          await this.db.withTransaction(async (client) => {
            const sub = await this.subsRepo.upsertSubscription(client, {
              storeId,
              planId,
              status: 'ACTIVE',
              billingPeriod,
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
              cancelledAt: null,
              razorpayPaymentId: paymentEntity.id,
            });

            await this.subsRepo.createPayment(client, {
              subscriptionId: sub.id,
              amount,
              currency: 'INR',
              status: 'PAID',
              razorpayOrderId: paymentEntity.order_id,
              razorpayPaymentId: paymentEntity.id,
            });
          });
        }
      }
    }

    return { success: true, received: true };
  }
}
