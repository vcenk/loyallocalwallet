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
  designLogoUrl?: string | null;
  // The owner's design choices — carried onto the real wallet pass so the
  // customer sees the card they designed (not a generic one).
  stampIcon?: string | null;
  pattern?: string | null;
  stampStyle?: string | null;
  programType?: string | null;
  // Latest campaign / review nudge shown on the pass (Apple back field).
  message?: string | null;
  messageLink?: string | null;
}
