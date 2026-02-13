import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const investigationCreateSchema = z.object({
  claimId: z.string().optional(),
  alertId: z.string().optional(),
  investigatorId: z.string().min(1, "Please select an investigator"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  targetDate: z.date().optional(),
  notes: z.string().optional(),
});

export type InvestigationCreateFormValues = z.infer<typeof investigationCreateSchema>;

export const claimFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  riskLevel: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  county: z.string().optional(),
  providerId: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(25),
});

export type ClaimFilterValues = z.infer<typeof claimFilterSchema>;

export const providerFilterSchema = z.object({
  search: z.string().optional(),
  county: z.string().optional(),
  facilityType: z.string().optional(),
  riskLevel: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(25),
});

export type ProviderFilterValues = z.infer<typeof providerFilterSchema>;

export const alertFilterSchema = z.object({
  severity: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  assignedTo: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(25),
});

export type AlertFilterValues = z.infer<typeof alertFilterSchema>;
