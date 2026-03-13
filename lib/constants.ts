import { AlertStatus, AlertType } from '@/types/alert';
import { ClaimStatus } from '@/types/claim';
import { RiskLevel } from '@/types/common';
import { CaseStatus } from '@/types/investigation';

export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#065f46', // dark green  — text on light bg
  MEDIUM: '#92400e', // dark amber  — text on light bg
  HIGH: '#b91c1c', // dark red    — text on light bg
  CRITICAL: '#5b21b6', // dark violet — text on light bg
};

// FIX [CRITICAL-4]: was inverted — dark bg colors with medium-tone text = poor contrast.
// Standard badge pattern: light tint bg + dark saturated text (same hue).
// RISK_COLORS (above) are the TEXT colors; RISK_BG_COLORS are the BACKGROUND tints.
export const RISK_BG_COLORS: Record<RiskLevel, string> = {
  LOW: '#d1fae5', // light green tint
  MEDIUM: '#fef3c7', // light amber tint
  HIGH: '#fee2e2', // light red tint
  CRITICAL: '#ede9fe', // light violet tint
};

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  SUBMITTED: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  FLAGGED: 'Flagged',
  UNDER_REVIEW: 'Under Investigation',
  PAID: 'Paid',
};

export const CLAIM_STATUS_COLORS: Record<ClaimStatus, string> = {
  SUBMITTED: '#6b7280',
  APPROVED: '#10b981',
  REJECTED: '#ef4444',
  FLAGGED: '#f59e0b',
  UNDER_REVIEW: '#7c3aed',
  PAID: '#10b981',
};

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  OPEN: 'Open',
  ACKNOWLEDGED: 'Acknowledged',
  INVESTIGATING: 'Investigating',
  ESCALATED: 'Escalated',
  RESOLVED: 'Resolved',
  EXPIRED: 'Expired',
};

export const ALERT_STATUS_COLORS: Record<AlertStatus, string> = {
  OPEN: '#ef4444',
  ACKNOWLEDGED: '#f59e0b',
  INVESTIGATING: '#3b82f6',
  RESOLVED: '#10b981',
  EXPIRED: '#6b7280',
  ESCALATED: '#ef4444',
};

// FIX [WRONG-2]: added GHOST_PROVIDER — backend AlertType enum gained this value
export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  HIGH_RISK_SCORE: 'High Risk Claim',
  CRITICAL_RISK_SCORE: 'Critical Risk Claim',
  DUPLICATE_CLAIM: 'Duplicate Claim',
  PHANTOM_PATIENT: 'Phantom Patient',
  UPCODING_DETECTED: 'Upcoding Detected',
  PROVIDER_ANOMALY: 'Provider Anomaly',
  GHOST_PROVIDER: 'Ghost Provider Detection',
  RULE_THRESHOLD_BREACH: 'Rule Threshold Breach',
  MEMBER_FREQUENCY_ABUSE: 'Member Frequency Abuse',
  PROVIDER_CLAIM_SPIKE: 'Provider Claim Spike',
  LATE_NIGHT_SUBMISSION: 'Late Night Claim Submission',
  BULK_SUBMISSION: 'Bulk Claim Submission',
  MODEL_CONFIDENCE_LOW: 'Low Model Confidence',
  RESUBMISSION_PATTERN: 'Suspicious Claim Resubmission Pattern',
};

export const INVESTIGATION_STATUS_LABELS: Record<CaseStatus, string> = {
  OPEN: 'Open',
  UNDER_REVIEW: 'In Progress',
  CONFIRMED_FRAUD: 'Fraud',
  CLEARED: 'Cleared',
  CLOSED: 'Closed',
};

export const INVESTIGATION_STATUS_COLORS: Record<CaseStatus, string> = {
  OPEN: '#ef4444',
  UNDER_REVIEW: '#f59e0b',
  CONFIRMED_FRAUD: '#ef4444',
  CLEARED: '#10b981',
  CLOSED: '#6b7280',
};

export const FACILITY_TYPES = [
  { value: 'PUBLIC_HOSPITAL', label: 'Public Hospital' },
  { value: 'PRIVATE_HOSPITAL', label: 'Private Hospital' },
  { value: 'CLINIC', label: 'Clinic' },
  { value: 'SPECIALIST_CENTER', label: 'Specialist Center' },
  { value: 'LABORATORY', label: 'Laboratory' },
  { value: 'PHARMACY', label: 'Pharmacy' },
  { value: 'FAITH_BASED', label: 'Faith Based' },
];

export const KENYAN_COUNTIES = [
  'Mombasa',
  'Kwale',
  'Kilifi',
  'Tana River',
  'Lamu',
  'Taita-Taveta',
  'Nakuru',
  'Nairobi',
  'Kiambu',
  'Muranga',
  'Nyeri',
  'Kirinyaga',
  'Embu',
  'Meru',
  'Isiolo',
  'Samburu',
  'Laikipia',
  'Turkana',
  'West Pokot',
  'Baringo',
  'Elgeyo-Marakwet',
  'Kericho',
  'Bomet',
  'Kakamega',
  'Vihiga',
  'Bungoma',
  'Busia',
  'Siaya',
  'Kisumu',
  'Homa Bay',
  'Migori',
  'Kisii',
  'Nyamira',
  'Narok',
  'Kajiado',
  'Makueni',
  'Machakos',
];

export const PAGINATION_OPTIONS = [10, 25, 50, 100];

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

// export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const API_TIMEOUT = 30000; // 30 seconds

export const REFRESH_INTERVALS = {
  DASHBOARD: 60000, // 1 minute
  CLAIMS: 30000, // 30 seconds
  ALERTS: 15000, // 15 seconds
};
