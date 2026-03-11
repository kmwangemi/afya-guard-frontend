// ─── Audit log domain types ───────────────────────────────────────────────────
// Aligned to backend AuditAction enum and AuditLogResponse schema

// All AuditAction values from backend enums.py
export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'TOKEN_REFRESHED'
  | 'PASSWORD_CHANGED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DEACTIVATED'
  | 'ROLE_ASSIGNED'
  | 'ROLE_REMOVED'
  | 'CLAIM_INGESTED'
  | 'CLAIM_STATUS_UPDATED'
  | 'FEATURES_COMPUTED'
  | 'CLAIM_SCORED'
  | 'SCORE_OVERRIDDEN'
  | 'CASE_CREATED'
  | 'CASE_ASSIGNED'
  | 'CASE_STATUS_UPDATED'
  | 'CASE_NOTE_ADDED'
  | 'CASE_CLOSED'
  | 'RULE_CREATED'
  | 'RULE_UPDATED'
  | 'RULE_TOGGLED'
  | 'MODEL_REGISTERED'
  | 'MODEL_DEPLOYED';

// Entity types referenced in audit logs
export type AuditEntityType =
  | 'Claim'
  | 'FraudCase'
  | 'FraudAlert'
  | 'User'
  | 'FraudRule'
  | 'ModelVersion'
  | 'FraudReport';

// One row from GET /api/v1/logs
export interface AuditLogEntry {
  id: string;
  userId: string | null;
  userFullName: string | null;
  userEmail: string | null;
  action: AuditAction;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  performedAt: string; // ISO datetime
}

// Filter params for GET /api/v1/logs
export interface LogFilterParams {
  action?: AuditAction;
  entityType?: string;
  userId?: string;
  fromDate?: string; // ISO datetime
  toDate?: string;
}

export interface ApiLogEntry {
  id: string;
  user_id: string | null;
  user_full_name: string | null;
  user_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  audit_log_metadata: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  performed_at: string;
}

export interface ApiPaginated {
  items: ApiLogEntry[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
