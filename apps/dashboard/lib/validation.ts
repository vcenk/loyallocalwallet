import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  fullName: z.string().trim().max(120).optional(),
});

export const createBusinessSchema = z.object({
  name: z.string().trim().min(2, "Business name is required.").max(120),
  industry: z.string().trim().max(60).optional(),
});

export const programDetailsSchema = z.object({
  name: z.string().trim().min(2, "Card name is required.").max(80),
  description: z.string().trim().max(300).optional(),
  stampsRequired: z.coerce
    .number()
    .int("Whole numbers only.")
    .min(1, "At least 1 stamp.")
    .max(50, "50 stamps max."),
  rewardTitle: z.string().trim().min(2, "Reward is required.").max(80),
  rewardDescription: z.string().trim().max(300).optional(),
});

export const programStatusSchema = z.enum(["draft", "active", "paused"]);

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color like #2563EB.");

export const designSchema = z.object({
  backgroundColor: hexColor,
  foregroundColor: hexColor,
  stampIcon: z.string().trim().max(24).optional(),
  pattern: z.string().trim().max(24).optional(),
});

export const businessProfileSchema = z.object({
  name: z.string().trim().min(2, "Business name is required.").max(120),
  industry: z.string().trim().max(60).optional(),
  phone: z.string().trim().max(30).optional(),
  website: z.string().trim().max(200).optional(),
  email: z
    .union([z.string().trim().email("Enter a valid email."), z.literal("")])
    .optional(),
  brandColor: hexColor.optional(),
  googleReviewUrl: z
    .union([z.string().trim().url("Enter a valid URL."), z.literal("")])
    .optional(),
});

// Roles an owner/admin can assign to staff (never owner or platform_admin).
export const ASSIGNABLE_ROLES = ["business_admin", "manager", "staff"] as const;

export const locationSchema = z.object({
  name: z.string().trim().min(2, "Location name is required.").max(120),
  addressLine1: z.string().trim().max(160).optional(),
  city: z.string().trim().max(80).optional(),
  province: z.string().trim().max(80).optional(),
  postalCode: z.string().trim().max(20).optional(),
  phone: z.string().trim().max(30).optional(),
});

export const inviteStaffSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  role: z.enum(ASSIGNABLE_ROLES),
  locationId: z
    .union([z.string().uuid(), z.literal("")])
    .optional(),
});

export const staffRoleSchema = z.object({
  staffMemberId: z.string().uuid(),
  role: z.enum(ASSIGNABLE_ROLES),
});

export const enrollSchema = z.object({
  firstName: z.string().trim().min(1, "Please enter your name.").max(80),
  email: z
    .union([z.string().trim().email("Enter a valid email."), z.literal("")])
    .optional(),
  phone: z.string().trim().max(30).optional(),
  platform: z.enum(["apple", "google"]),
  birthMonth: z.coerce.number().int().min(1).max(12).optional(),
  birthDay: z.coerce.number().int().min(1).max(31).optional(),
});
