import { mlService } from '@/services/mlService';
import {
  CreateRulePayload,
  RegisterModelPayload,
  UpdateRulePayload,
} from '@/types/ml';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const RULES_KEY = 'fraud-rules';
const MODELS_KEY = 'model-versions';

// ── Rules ─────────────────────────────────────────────────────────────────────

export function useRules(
  params: { activeOnly?: boolean; category?: string } = {},
) {
  return useQuery({
    queryKey: [RULES_KEY, params],
    queryFn: () => mlService.listRules(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRule(ruleId: string | null) {
  return useQuery({
    queryKey: [RULES_KEY, ruleId],
    queryFn: () => mlService.getRule(ruleId!),
    enabled: !!ruleId,
  });
}

export function useCreateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRulePayload) => mlService.createRule(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RULES_KEY] }),
  });
}

export function useUpdateRule(ruleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRulePayload) =>
      mlService.updateRule(ruleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RULES_KEY] });
      qc.invalidateQueries({ queryKey: [RULES_KEY, ruleId] });
    },
  });
}

export function useToggleRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => mlService.toggleRule(ruleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RULES_KEY] }),
  });
}

// ── Models ────────────────────────────────────────────────────────────────────

export function useModels() {
  return useQuery({
    queryKey: [MODELS_KEY],
    queryFn: () => mlService.listModels(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRegisterModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterModelPayload) =>
      mlService.registerModel(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [MODELS_KEY] }),
  });
}

export function useDeployModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (modelId: string) => mlService.deployModel(modelId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [MODELS_KEY] }),
  });
}
