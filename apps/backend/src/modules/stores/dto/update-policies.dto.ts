// apps/backend/src/modules/stores/dto/update-policies.dto.ts
export class UpdatePoliciesDto {
  policyType?: string;
  deliveryPolicyHeading?: string | null;
  deliveryPolicyDescription?: string | null;
  deliveryPoints?: any[] | null;
  refundPolicyHeading?: string | null;
  refundPolicyDescription?: string | null;
  refundPoints?: any[] | null;
  privacyPolicyHeading?: string | null;
  privacyPolicyDescription?: string | null;
  privacyPoints?: any[] | null;
}
