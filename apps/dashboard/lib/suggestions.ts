// Turns the shop's current state into a short, prioritized list of next actions
// shown on the dashboard — so a busy owner always knows the highest-value thing
// to do next. Pure function; the page gathers the inputs.

export interface Suggestion {
  key: string;
  icon: "zap" | "megaphone" | "gift" | "star" | "sparkles" | "image";
  title: string;
  description: string;
  cta: string;
  href: string;
}

export interface SuggestionInput {
  inactiveCount: number;
  closeToReward: number;
  hasLogo: boolean;
  hasReviewUrl: boolean;
  welcomeBonus: number;
  anyAutomationEnabled: boolean;
  winBackEnabled: boolean;
}

export function buildSuggestions(input: SuggestionInput): Suggestion[] {
  const out: Suggestion[] = [];

  if (input.inactiveCount > 0 && !input.winBackEnabled) {
    out.push({
      key: "win_back_auto",
      icon: "zap",
      title: "Recover fading customers automatically",
      description: `${input.inactiveCount} haven't visited in a while. Turn on win-back and they'll be nudged for you.`,
      cta: "Set up win-back",
      href: "/dashboard/automations",
    });
  } else if (input.inactiveCount > 0) {
    out.push({
      key: "win_back_send",
      icon: "megaphone",
      title: "Win back fading customers",
      description: `${input.inactiveCount} are slipping away. Send them an offer.`,
      cta: "Send campaign",
      href: "/dashboard/campaigns/new",
    });
  }

  if (input.closeToReward > 0) {
    out.push({
      key: "close_to_reward",
      icon: "gift",
      title: "Nudge customers close to a reward",
      description: `${input.closeToReward} are one or two stamps away — a reminder brings them in.`,
      cta: "Remind them",
      href: "/dashboard/campaigns/new",
    });
  }

  if (!input.hasReviewUrl) {
    out.push({
      key: "review_link",
      icon: "star",
      title: "Collect more reviews",
      description: "Add your Google review link — we invite happy customers after they redeem.",
      cta: "Add link",
      href: "/dashboard/settings",
    });
  }

  if (input.welcomeBonus === 0) {
    out.push({
      key: "welcome_bonus",
      icon: "sparkles",
      title: "Hook new customers with a welcome bonus",
      description: "Give new sign-ups a free stamp so they start with momentum.",
      cta: "Enable it",
      href: "/dashboard/settings",
    });
  }

  if (!input.anyAutomationEnabled) {
    out.push({
      key: "automations",
      icon: "zap",
      title: "Put your marketing on autopilot",
      description: "Turn on welcome, win-back and birthday messages that run themselves.",
      cta: "Set up automations",
      href: "/dashboard/automations",
    });
  }

  if (!input.hasLogo) {
    out.push({
      key: "logo",
      icon: "image",
      title: "Add your logo",
      description: "Your logo shows on every wallet card and enrollment page.",
      cta: "Upload logo",
      href: "/dashboard/settings",
    });
  }

  return out.slice(0, 3);
}
