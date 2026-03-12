// ─── Enums ────────────────────────────────────────────────────────────────────

export type ModelType =
  | 'XGBOOST'
  | 'LIGHTGBM'
  | 'ISOLATION_FOREST'
  | 'AUTOENCODER'
  | 'LOGISTIC';

export type RuleOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'in'
  | 'not_in'
  | 'is_true'
  | 'is_false';

export type RuleCategory =
  | 'duplicate'
  | 'upcoding'
  | 'provider'
  | 'member'
  | 'timing';

// ─── Rule config expression ───────────────────────────────────────────────────

export interface RuleConfig {
  field: string;
  operator: RuleOperator;
  value: string | number | boolean | string[] | null;
}

// ─── Fraud Rule ───────────────────────────────────────────────────────────────

export interface FraudRule {
  id: string;
  ruleName: string;
  displayName: string | null;
  description: string | null;
  category: RuleCategory | null;
  weight: number; // 0–100 score contribution when rule fires
  config: RuleConfig;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRulePayload {
  ruleName: string;
  displayName?: string;
  description?: string;
  category?: RuleCategory;
  weight: number;
  config: RuleConfig;
  isActive?: boolean;
}

export interface UpdateRulePayload {
  displayName?: string;
  description?: string;
  weight?: number;
  config?: RuleConfig;
  category?: RuleCategory;
}

export interface RuleToggleResponse {
  ruleName: string;
  isActive: boolean;
  message: string;
}

// ─── Model Version ────────────────────────────────────────────────────────────

export interface PerformanceMetrics {
  auc_roc?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  accuracy?: number;
  [key: string]: number | undefined;
}

export interface ModelVersion {
  id: string;
  versionName: string;
  modelType: ModelType;
  description: string | null;
  trainingStart: string | null; // ISO date
  trainingEnd: string | null;
  trainingSampleSize: number | null;
  modelArtifactPath: string | null;
  performanceMetrics: PerformanceMetrics | null;
  featureNames: string[] | null;
  isDeployed: boolean;
  deployedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterModelPayload {
  versionName: string;
  modelType: ModelType;
  description?: string;
  trainingStart?: string;
  trainingEnd?: string;
  trainingSampleSize?: number;
  modelArtifactPath?: string;
  performanceMetrics?: PerformanceMetrics;
  featureNames?: string[];
}

export interface ModelDeployResponse {
  versionName: string;
  isDeployed: boolean;
  deployedAt: string;
  message: string;
}
