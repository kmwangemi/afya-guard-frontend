import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Investigation ────────────────────────────────────────────────────────────

export const investigationCreateSchema = z.object({
  claimId: z.string().optional(),
  alertId: z.string().optional(),
  investigatorId: z.string().min(1, 'Please select an investigator'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  targetDate: z.date().optional(),
  notes: z.string().optional(),
});
export type InvestigationCreateFormValues = z.infer<
  typeof investigationCreateSchema
>;

// ─── Claims ───────────────────────────────────────────────────────────────────
// Fix 1: status value "under_investigation" → "under_review" to match backend UNDER_REVIEW enum.
// Fix 2: dateFrom/dateTo removed from schema — the claim list endpoint (GET /claims)
//         does not accept date filter params. Keeping them in the form schema would cause
//         ClaimFilterValues to pass dates into ClaimFilterParams where they have no effect.
// Fix 3: page/pageSize removed — pagination is managed by ClaimsPage state, not the filter form.
//         Having them in the form schema caused ClaimFilters to pass pageSize to onFilter()
//         where it was ignored (ClaimsPage owns pageSize state separately).

export const claimFilterSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(['', 'pending', 'approved', 'rejected', 'flagged', 'under_review'])
    .optional(),
  riskLevel: z.enum(['', 'low', 'medium', 'high', 'critical']).optional(),
  county: z.string().optional(),
  providerId: z.string().optional(),
});
export type ClaimFilterValues = z.infer<typeof claimFilterSchema>;

// ─── Providers ────────────────────────────────────────────────────────────────
// Fix 3 (same): page/pageSize belong to page state, not filter schema.

export const providerFilterSchema = z.object({
  search: z.string().optional(),
  county: z.string().optional(),
  facilityType: z.string().optional(),
  riskLevel: z.string().optional(),
});
export type ProviderFilterValues = z.infer<typeof providerFilterSchema>;

// ─── Alerts ───────────────────────────────────────────────────────────────────
// Fix 2 (same): dateFrom/dateTo removed — alert list endpoint has no date filter params.
// Fix 3 (same): page/pageSize removed.

export const alertFilterSchema = z.object({
  severity: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  assignedTo: z.string().optional(),
});
export type AlertFilterValues = z.infer<typeof alertFilterSchema>;
