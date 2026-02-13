import { RiskLevel, ClaimStatus } from "@/types/claim";
import { AlertStatus, AlertType } from "@/types/alert";
import { InvestigationStatus, InvestigationPriority } from "@/types/investigation";

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: "#10b981", // green
  medium: "#f59e0b", // amber
  high: "#ef4444", // red
  critical: "#7c3aed", // violet
};

export const RISK_BG_COLORS: Record<RiskLevel, string> = {
  low: "#ecfdf5",
  medium: "#fffbeb",
  high: "#fef2f2",
  critical: "#faf5ff",
};

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  flagged: "Flagged",
  under_investigation: "Under Investigation",
};

export const CLAIM_STATUS_COLORS: Record<ClaimStatus, string> = {
  pending: "#6b7280",
  approved: "#10b981",
  rejected: "#ef4444",
  flagged: "#f59e0b",
  under_investigation: "#7c3aed",
};

export const ALERT_STATUS_LABELS: Record<AlertStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  investigating: "Investigating",
  resolved: "Resolved",
  closed: "Closed",
};

export const ALERT_STATUS_COLORS: Record<AlertStatus, string> = {
  open: "#ef4444",
  assigned: "#f59e0b",
  investigating: "#3b82f6",
  resolved: "#10b981",
  closed: "#6b7280",
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  high_risk_claim: "High Risk Claim",
  phantom_patient: "Phantom Patient",
  upcoding: "Upcoding Detected",
  duplicate_claim: "Duplicate Claim",
  provider_anomaly: "Provider Anomaly",
  volume_spike: "Volume Spike",
  pattern_detected: "Pattern Detected",
};

export const INVESTIGATION_STATUS_LABELS: Record<InvestigationStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  pending_review: "Pending Review",
  completed: "Completed",
  closed: "Closed",
};

export const INVESTIGATION_STATUS_COLORS: Record<InvestigationStatus, string> = {
  open: "#ef4444",
  in_progress: "#f59e0b",
  pending_review: "#3b82f6",
  completed: "#10b981",
  closed: "#6b7280",
};

export const INVESTIGATION_PRIORITY_LABELS: Record<InvestigationPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const INVESTIGATION_PRIORITY_COLORS: Record<InvestigationPriority, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#ef4444",
  critical: "#7c3aed",
};

export const FACILITY_TYPES = [
  { value: "hospital", label: "Hospital" },
  { value: "clinic", label: "Clinic" },
  { value: "diagnostic", label: "Diagnostic Center" },
  { value: "laboratory", label: "Laboratory" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "other", label: "Other" },
];

export const KENYAN_COUNTIES = [
  "Mombasa",
  "Kwale",
  "Kilifi",
  "Tana River",
  "Lamu",
  "Taita-Taveta",
  "Nakuru",
  "Nairobi",
  "Kiambu",
  "Muranga",
  "Nyeri",
  "Kirinyaga",
  "Embu",
  "Meru",
  "Isiolo",
  "Samburu",
  "Laikipia",
  "Turkana",
  "West Pokot",
  "Baringo",
  "Elgeyo-Marakwet",
  "Kericho",
  "Bomet",
  "Kakamega",
  "Vihiga",
  "Bungoma",
  "Busia",
  "Siaya",
  "Kisumu",
  "Homa Bay",
  "Migori",
  "Kisii",
  "Nyamira",
  "Narok",
  "Kajiado",
  "Makueni",
  "Machakos",
];

export const PAGINATION_OPTIONS = [10, 25, 50, 100];

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const API_TIMEOUT = 30000; // 30 seconds

export const REFRESH_INTERVALS = {
  DASHBOARD: 60000, // 1 minute
  CLAIMS: 30000, // 30 seconds
  ALERTS: 15000, // 15 seconds
};

export const MOCK_API_ENABLED = process.env.NEXT_PUBLIC_MOCK_API === "true";
