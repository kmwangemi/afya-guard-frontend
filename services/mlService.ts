import { api, handleApiError } from '@/lib/api';
import {
  CreateRulePayload,
  FraudRule,
  ModelDeployResponse,
  ModelVersion,
  RegisterModelPayload,
  RuleCategory,
  RuleToggleResponse,
  UpdateRulePayload,
} from '@/types/ml';

// ─── Backend shapes (snake_case) ──────────────────────────────────────────────

interface ApiRule {
  id: string;
  rule_name: string;
  display_name: string | null;
  description: string | null;
  category: string | null;
  weight: number;
  config: { field: string; operator: string; value: unknown };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiModel {
  id: string;
  version_name: string;
  model_type: string;
  description: string | null;
  training_start: string | null;
  training_end: string | null;
  training_sample_size: number | null;
  model_artifact_path: string | null;
  performance_metrics: Record<string, number> | null;
  feature_names: string[] | null;
  is_deployed: boolean;
  deployed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ApiToggle {
  rule_name: string;
  is_active: boolean;
  message: string;
}

interface ApiDeployResponse {
  version_name: string;
  is_deployed: boolean;
  deployed_at: string;
  message: string;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapRule(r: ApiRule): FraudRule {
  return {
    id: r.id,
    ruleName: r.rule_name,
    displayName: r.display_name,
    description: r.description,
    category: r.category as RuleCategory | null,
    weight: r.weight,
    config: r.config as FraudRule['config'],
    isActive: r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapModel(m: ApiModel): ModelVersion {
  return {
    id: m.id,
    versionName: m.version_name,
    modelType: m.model_type as ModelVersion['modelType'],
    description: m.description,
    trainingStart: m.training_start,
    trainingEnd: m.training_end,
    trainingSampleSize: m.training_sample_size,
    modelArtifactPath: m.model_artifact_path,
    performanceMetrics: m.performance_metrics,
    featureNames: m.feature_names,
    isDeployed: m.is_deployed,
    deployedAt: m.deployed_at,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const mlService = {
  // ── Rules ──────────────────────────────────────────────────────────────────

  listRules: async (
    params: {
      activeOnly?: boolean;
      category?: string;
    } = {},
  ): Promise<FraudRule[]> => {
    try {
      const query: Record<string, string | boolean> = {};
      if (params.activeOnly) query.active_only = true;
      if (params.category) query.category = params.category;
      const data = await api.get<ApiRule[]>('/rules', { params: query });
      return data.map(mapRule);
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },
  getRule: async (ruleId: string): Promise<FraudRule> => {
    try {
      const data = await api.get<ApiRule>(`/rules/${ruleId}`);
      return mapRule(data);
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },
  createRule: async (payload: CreateRulePayload): Promise<FraudRule> => {
    try {
      const data = await api.post<ApiRule>('/rules', {
        rule_name: payload.ruleName,
        display_name: payload.displayName,
        description: payload.description,
        category: payload.category,
        weight: payload.weight,
        config: payload.config,
        is_active: payload.isActive ?? true,
      });
      return mapRule(data);
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },
  updateRule: async (
    ruleId: string,
    payload: UpdateRulePayload,
  ): Promise<FraudRule> => {
    try {
      const data = await api.patch<ApiRule>(`/rules/${ruleId}`, {
        display_name: payload.displayName,
        description: payload.description,
        weight: payload.weight,
        config: payload.config,
        category: payload.category,
      });
      return mapRule(data);
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  toggleRule: async (ruleId: string): Promise<RuleToggleResponse> => {
    try {
      const data = await api.patch<ApiToggle>(`/rules/${ruleId}/toggle`);
      return {
        ruleName: data.rule_name,
        isActive: data.is_active,
        message: data.message,
      };
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  // ── Models ─────────────────────────────────────────────────────────────────

  listModels: async (): Promise<ModelVersion[]> => {
    try {
      const data = await api.get<ApiModel[]>('/models');
      return data.map(mapModel);
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },
  getModel: async (modelId: string): Promise<ModelVersion> => {
    try {
      const data = await api.get<ApiModel>(`/models/${modelId}`);
      return mapModel(data);
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },
  registerModel: async (
    payload: RegisterModelPayload,
  ): Promise<ModelVersion> => {
    try {
      const data = await api.post<ApiModel>('/models', {
        version_name: payload.versionName,
        model_type: payload.modelType,
        description: payload.description,
        training_start: payload.trainingStart,
        training_end: payload.trainingEnd,
        training_sample_size: payload.trainingSampleSize,
        model_artifact_path: payload.modelArtifactPath,
        performance_metrics: payload.performanceMetrics,
        feature_names: payload.featureNames,
      });
      return mapModel(data);
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },
  deployModel: async (modelId: string): Promise<ModelDeployResponse> => {
    try {
      const data = await api.patch<ApiDeployResponse>(
        `/models/${modelId}/deploy`,
      );
      return {
        versionName: data.version_name,
        isDeployed: data.is_deployed,
        deployedAt: data.deployed_at,
        message: data.message,
      };
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },
};
