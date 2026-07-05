// Everything needed to render a loyalty pass on either platform.
export interface WalletCardData {
  serialNumber: string;
  businessId: string;
  programId: string;
  businessName: string;
  programName: string;
  rewardTitle: string;
  stampsRequired: number;
  currentStamps: number;
  rewardsAvailable: number;
  customerName: string;
  backgroundColor: string; // hex, e.g. #ae3115
  foregroundColor: string; // hex, e.g. #ffffff
  logoUrl?: string | null;
}
