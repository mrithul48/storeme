// apps/backend/src/modules/subscriptions/subscriptions.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UseGuards,
  Req,
  Ip,
  HttpCode,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import {
  SubscriptionCheckoutDto,
  SubscriptionVerifyDto,
  CancelSubscriptionDto,
} from './dto/subscription.dto';
import { CompositeAuthGuard } from '../../common/guards/composite-auth.guard';
import { CurrentStore } from '../../common/decorators/current-store.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('subscriptions')
@UseGuards(CompositeAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  async getCurrentSubscription(@CurrentStore('id') storeId: string) {
    return this.subscriptionsService.getCurrentSubscription(storeId);
  }

  @Post('checkout')
  async initiateCheckout(
    @CurrentStore('id') storeId: string,
    @Body() dto: SubscriptionCheckoutDto,
  ) {
    return this.subscriptionsService.initiateCheckout(storeId, dto);
  }

  @Post('verify')
  async verifyPayment(
    @CurrentStore('id') storeId: string,
    @Body() dto: SubscriptionVerifyDto,
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const user = req.user || { id: 'unknown', email: 'merchant@store.local' };
    return this.subscriptionsService.verifyPayment(storeId, dto, user, ip);
  }

  @Post('cancel')
  @HttpCode(200)
  async cancelSubscription(
    @CurrentStore('id') storeId: string,
    @Body() dto: CancelSubscriptionDto,
    @Req() req: any,
    @Ip() ip: string,
  ) {
    const user = req.user || { id: 'unknown', email: 'merchant@store.local' };
    return this.subscriptionsService.cancelSubscription(storeId, dto, user, ip);
  }

  @Post('webhook')
  @Public()
  async handleWebhook(
    @Body() rawBody: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const bodyStr = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
    return this.subscriptionsService.handleWebhook(bodyStr, signature || null);
  }
}

