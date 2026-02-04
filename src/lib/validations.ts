import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.email().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const InvestigationFormSchema = z.object({
  case_number: z.string().min(1, 'Case number is required'),
  investigator_id: z.number().min(1, 'Investigator is required'),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  target_completion_date: z.string().optional(),
  findings: z.string().optional(),
  recommendations: z.string().optional(),
});

export const ClaimFilterSchema = z.object({
  status: z.string().optional(),
  risk_level: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  provider_id: z.string().optional(),
  search: z.string().optional(),
});

export const AlertFilterSchema = z.object({
  status: z.string().optional(),
  severity: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  assigned_to: z.string().optional(),
});

export type LoginFormData = z.infer<typeof LoginSchema>;
export type InvestigationFormData = z.infer<typeof InvestigationFormSchema>;
export type ClaimFilters = z.infer<typeof ClaimFilterSchema>;
export type AlertFilters = z.infer<typeof AlertFilterSchema>;
