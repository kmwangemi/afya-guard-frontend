'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useCreateRule,
  useDeployModel,
  useModels,
  useRegisterModel,
  useRules,
  useToggleRule,
  useUpdateRule,
} from '@/hooks/queries/useML';
import { useToast } from '@/hooks/use-toast';
import {
  CreateRulePayload,
  FraudRule,
  ModelType,
  ModelVersion,
  PerformanceMetrics,
  RegisterModelPayload,
  RuleCategory,
  RuleConfig,
  RuleOperator,
  UpdateRulePayload,
} from '@/types/ml';
import {
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Clock,
  Code2,
  Edit2,
  FlaskConical,
  Loader2,
  Plus,
  Power,
  PowerOff,
  Rocket,
  Search,
  Shield,
  Sliders,
  Sparkles,
  Tag,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

// ─── Constants ────────────────────────────────────────────────────────────────

const RULE_CATEGORIES: {
  value: RuleCategory;
  label: string;
  color: string;
  icon: React.ElementType;
}[] = [
  {
    value: 'duplicate',
    label: 'Duplicate',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: CircleDot,
  },
  {
    value: 'upcoding',
    label: 'Upcoding',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: TrendingUp,
  },
  {
    value: 'provider',
    label: 'Provider',
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    icon: Shield,
  },
  {
    value: 'member',
    label: 'Member',
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    icon: Tag,
  },
  {
    value: 'timing',
    label: 'Timing',
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    icon: Clock,
  },
];

const RULE_FIELDS = [
  {
    value: 'duplicate_within_7d',
    label: 'Duplicate within 7 days',
    type: 'bool',
  },
  {
    value: 'duplicate_within_30d',
    label: 'Duplicate within 30 days',
    type: 'bool',
  },
  {
    value: 'provider_cost_zscore',
    label: 'Provider cost Z-score',
    type: 'number',
  },
  { value: 'claim_amount', label: 'Claim amount (KES)', type: 'number' },
  { value: 'service_count', label: 'Service count', type: 'number' },
  {
    value: 'late_night_submission',
    label: 'Late-night submission',
    type: 'bool',
  },
  { value: 'bulk_submission', label: 'Bulk submission', type: 'bool' },
  { value: 'length_of_stay', label: 'Length of stay (days)', type: 'number' },
  { value: 'resubmission_count', label: 'Resubmission count', type: 'number' },
  {
    value: 'member_claim_frequency_30d',
    label: 'Member claims in 30 days',
    type: 'number',
  },
  {
    value: 'provider_high_risk_flag',
    label: 'Provider flagged high-risk',
    type: 'bool',
  },
  {
    value: 'phantom_patient_score',
    label: 'Phantom patient score',
    type: 'number',
  },
  { value: 'upcoding_score', label: 'Upcoding detector score', type: 'number' },
  {
    value: 'ghost_provider_score',
    label: 'Ghost provider score',
    type: 'number',
  },
];

const OPERATORS_FOR_BOOL: RuleOperator[] = ['is_true', 'is_false'];
const OPERATORS_FOR_NUMBER: RuleOperator[] = [
  'greater_than',
  'less_than',
  'greater_or_equal',
  'less_or_equal',
  'equals',
  'not_equals',
];
const OPERATOR_LABELS: Record<RuleOperator, string> = {
  equals: '= equals',
  not_equals: '≠ not equals',
  greater_than: '> greater than',
  less_than: '< less than',
  greater_or_equal: '≥ greater or equal',
  less_or_equal: '≤ less or equal',
  in: 'in list',
  not_in: 'not in list',
  is_true: 'is TRUE',
  is_false: 'is FALSE',
};

const MODEL_TYPE_META: Record<
  ModelType,
  { label: string; icon: React.ElementType; color: string }
> = {
  XGBOOST: {
    label: 'XGBoost',
    icon: Zap,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  LIGHTGBM: {
    label: 'LightGBM',
    icon: Sparkles,
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  ISOLATION_FOREST: {
    label: 'Isolation Forest',
    icon: FlaskConical,
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  },
  AUTOENCODER: {
    label: 'Autoencoder',
    icon: Brain,
    color: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  LOGISTIC: {
    label: 'Logistic',
    icon: BarChart3,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function categoryMeta(cat: RuleCategory | null) {
  return RULE_CATEGORIES.find(c => c.value === cat) ?? null;
}

function fieldMeta(field: string) {
  return RULE_FIELDS.find(f => f.value === field) ?? null;
}

function metricBar(value: number) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 90
      ? 'bg-emerald-500'
      : pct >= 75
        ? 'bg-blue-500'
        : pct >= 60
          ? 'bg-amber-500'
          : 'bg-red-500';
  return (
    <div className='flex items-center gap-2'>
      <div className='flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden'>
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className='text-xs font-mono w-10 text-right text-gray-700'>
        {(value * 100).toFixed(1)}%
      </span>
    </div>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Rule Config Preview ──────────────────────────────────────────────────────

function RuleConfigChip({ config }: { config: RuleConfig }) {
  const field = fieldMeta(config.field);
  const opLabel = OPERATOR_LABELS[config.operator] ?? config.operator;
  return (
    <code className='inline-flex items-center gap-1.5 bg-gray-900 text-gray-100 text-xs px-2.5 py-1 rounded-md font-mono'>
      <span className='text-sky-400'>{field?.label ?? config.field}</span>
      <span className='text-gray-500'>{opLabel}</span>
      {config.value !== null && config.value !== undefined && (
        <span className='text-amber-400'>{String(config.value)}</span>
      )}
    </code>
  );
}

// ─── Rule Drawer ──────────────────────────────────────────────────────────────

interface RuleDrawerProps {
  mode: 'create' | 'edit';
  rule?: FraudRule | null;
  onClose: () => void;
}

type RuleFormValues = {
  ruleName: string;
  displayName: string;
  description: string;
  category: RuleCategory | '';
  weight: number;
  field: string;
  operator: RuleOperator | '';
  value: string;
};

function RuleDrawer({ mode, rule, onClose }: RuleDrawerProps) {
  const { toast } = useToast();
  const createMut = useCreateRule();
  const updateMut = useUpdateRule(rule?.id ?? '');
  const selectedField = RULE_FIELDS.find(f => f.value === rule?.config?.field);
  const defaultOp = selectedField?.type === 'bool' ? 'is_true' : 'greater_than';
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RuleFormValues>({
    defaultValues: {
      ruleName: rule?.ruleName ?? '',
      displayName: rule?.displayName ?? '',
      description: rule?.description ?? '',
      category: rule?.category ?? '',
      weight: rule?.weight ?? 10,
      field: rule?.config?.field ?? '',
      operator: (rule?.config?.operator as RuleOperator) ?? defaultOp,
      value: rule?.config?.value != null ? String(rule.config.value) : '',
    },
  });
  const watchField = watch('field');
  const watchOperator = watch('operator');
  const currentField = RULE_FIELDS.find(f => f.value === watchField);
  const isBool = currentField?.type === 'bool';
  const availableOps = isBool ? OPERATORS_FOR_BOOL : OPERATORS_FOR_NUMBER;
  // Auto-switch operator when field type changes
  useEffect(() => {
    if (isBool && !OPERATORS_FOR_BOOL.includes(watchOperator as RuleOperator)) {
      setValue('operator', 'is_true');
    } else if (
      !isBool &&
      !OPERATORS_FOR_NUMBER.includes(watchOperator as RuleOperator)
    ) {
      setValue('operator', 'greater_than');
    }
  }, [isBool, watchOperator, setValue]);
  const isLoading = createMut.isPending || updateMut.isPending;
  async function onSubmit(v: RuleFormValues) {
    const config: RuleConfig = {
      field: v.field,
      operator: v.operator as RuleOperator,
      value: isBool ? null : isNaN(Number(v.value)) ? v.value : Number(v.value),
    };
    try {
      if (mode === 'create') {
        await createMut.mutateAsync({
          ruleName: v.ruleName,
          displayName: v.displayName || undefined,
          description: v.description || undefined,
          category: (v.category as RuleCategory) || undefined,
          weight: v.weight,
          config,
        } satisfies CreateRulePayload);
        toast({
          title: 'Rule created',
          description: `"${v.displayName || v.ruleName}" is now active.`,
        });
      } else {
        await updateMut.mutateAsync({
          displayName: v.displayName || undefined,
          description: v.description || undefined,
          category: (v.category as RuleCategory) || undefined,
          weight: v.weight,
          config,
        } satisfies UpdateRulePayload);
        toast({
          title: 'Rule updated',
          description: 'Changes saved successfully.',
        });
      }
      onClose();
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed',
        variant: 'destructive',
      });
    }
  }
  return (
    <div className='fixed inset-0 z-40 flex justify-end'>
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />
      <div className='relative bg-white w-full max-w-lg h-full flex flex-col shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50'>
          <div className='flex items-center gap-2.5'>
            <div className='p-1.5 bg-blue-100 rounded-md'>
              <Sliders className='h-4 w-4 text-blue-600' />
            </div>
            <h2 className='font-semibold text-gray-900'>
              {mode === 'create'
                ? 'New Fraud Rule'
                : `Edit — ${rule?.displayName ?? rule?.ruleName}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600'
          >
            <X className='h-5 w-5' />
          </button>
        </div>
        {/* Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex-1 overflow-y-auto px-6 py-5 space-y-5'
        >
          {/* Rule name — create only */}
          {mode === 'create' && (
            <div>
              <Label className='text-sm font-medium text-gray-700'>
                Machine Name *
              </Label>
              <Input
                className='mt-1 font-mono text-sm'
                placeholder='e.g. duplicate_claim_7d'
                {...register('ruleName', {
                  required: 'Required',
                  pattern: {
                    value: /^[a-z0-9_]+$/,
                    message: 'Lowercase letters, numbers, underscores only',
                  },
                })}
              />
              {errors.ruleName && (
                <p className='text-xs text-red-500 mt-1'>
                  {errors.ruleName.message}
                </p>
              )}
              <p className='text-xs text-gray-400 mt-1'>
                Used in code. Cannot be changed after creation.
              </p>
            </div>
          )}
          {/* Display name */}
          <div>
            <Label className='text-sm font-medium text-gray-700'>
              Display Name
            </Label>
            <Input
              className='mt-1'
              placeholder='e.g. Duplicate Claim (7 days)'
              {...register('displayName')}
            />
          </div>
          {/* Description */}
          <div>
            <Label className='text-sm font-medium text-gray-700'>
              Description
            </Label>
            <textarea
              className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring'
              rows={2}
              placeholder='What does this rule detect?'
              {...register('description')}
            />
          </div>
          {/* Category */}
          <div>
            <Label className='text-sm font-medium text-gray-700'>
              Category
            </Label>
            <div className='flex flex-wrap gap-2 mt-2'>
              {RULE_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const selected = watch('category') === cat.value;
                return (
                  <button
                    key={cat.value}
                    type='button'
                    onClick={() =>
                      setValue('category', selected ? '' : cat.value)
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      selected
                        ? cat.color + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className='h-3 w-3' />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Weight */}
          <div>
            <div className='flex items-center justify-between mb-1'>
              <Label className='text-sm font-medium text-gray-700'>
                Score Weight
              </Label>
              <span className='text-sm font-bold text-gray-900 tabular-nums'>
                {watch('weight')}
              </span>
            </div>
            <input
              type='range'
              min={1}
              max={100}
              step={1}
              className='w-full accent-blue-600'
              {...register('weight', { valueAsNumber: true })}
            />
            <div className='flex justify-between text-xs text-gray-400 mt-0.5'>
              <span>1 — minor signal</span>
              <span>100 — fires = critical</span>
            </div>
            <p className='text-xs text-gray-400 mt-1'>
              Points added to the fraud score when this rule fires. Multiple
              rules sum together.
            </p>
          </div>
          {/* Rule Logic */}
          <div className='p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3'>
            <p className='text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5'>
              <Code2 className='h-3.5 w-3.5' />
              Rule Expression
            </p>
            {/* Field picker */}
            <div>
              <Label className='text-xs text-gray-600'>Field *</Label>
              <select
                className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                {...register('field', { required: 'Field is required' })}
              >
                <option value=''>— Select a claim feature —</option>
                {RULE_FIELDS.map(f => (
                  <option key={f.value} value={f.value}>
                    {f.label} ({f.type})
                  </option>
                ))}
              </select>
              {errors.field && (
                <p className='text-xs text-red-500 mt-1'>
                  {errors.field.message}
                </p>
              )}
            </div>
            {/* Operator picker */}
            {watchField && (
              <div>
                <Label className='text-xs text-gray-600'>Operator *</Label>
                <select
                  className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                  {...register('operator', { required: true })}
                >
                  {availableOps.map(op => (
                    <option key={op} value={op}>
                      {OPERATOR_LABELS[op]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {/* Value — hidden for bool operators */}
            {watchField && !isBool && (
              <div>
                <Label className='text-xs text-gray-600'>
                  Threshold Value *
                </Label>
                <Input
                  className='mt-1 font-mono text-sm'
                  placeholder='e.g. 3.0'
                  type='number'
                  step='any'
                  {...register('value', {
                    required: !isBool ? 'Value is required' : false,
                  })}
                />
                {errors.value && (
                  <p className='text-xs text-red-500 mt-1'>
                    {errors.value.message}
                  </p>
                )}
              </div>
            )}
            {/* Live preview */}
            {watchField && watch('operator') && (
              <div className='pt-1'>
                <p className='text-xs text-gray-500 mb-1.5'>Preview:</p>
                <RuleConfigChip
                  config={{
                    field: watchField,
                    operator: watch('operator') as RuleOperator,
                    value: isBool
                      ? null
                      : watch('value')
                        ? Number(watch('value'))
                        : null,
                  }}
                />
              </div>
            )}
          </div>
        </form>
        {/* Footer */}
        <div className='px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className='min-w-[120px]'
          >
            {isLoading && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
            {mode === 'create' ? 'Create Rule' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Register Model Drawer ────────────────────────────────────────────────────

function RegisterModelDrawer({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const registerMut = useRegisterModel();
  type ModelFormValues = {
    versionName: string;
    modelType: ModelType | '';
    description: string;
    trainingStart: string;
    trainingEnd: string;
    trainingSampleSize: string;
    modelArtifactPath: string;
    aucRoc: string;
    precision: string;
    recall: string;
    f1: string;
    featureNames: string; // comma-separated
  };
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ModelFormValues>({ defaultValues: { modelType: '' } });
  const isLoading = registerMut.isPending;
  async function onSubmit(v: ModelFormValues) {
    const metrics: PerformanceMetrics = {};
    if (v.aucRoc) metrics.auc_roc = parseFloat(v.aucRoc);
    if (v.precision) metrics.precision = parseFloat(v.precision);
    if (v.recall) metrics.recall = parseFloat(v.recall);
    if (v.f1) metrics.f1 = parseFloat(v.f1);
    const features = v.featureNames
      ? v.featureNames
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      : undefined;
    try {
      await registerMut.mutateAsync({
        versionName: v.versionName,
        modelType: v.modelType as ModelType,
        description: v.description || undefined,
        trainingStart: v.trainingStart || undefined,
        trainingEnd: v.trainingEnd || undefined,
        trainingSampleSize: v.trainingSampleSize
          ? parseInt(v.trainingSampleSize)
          : undefined,
        modelArtifactPath: v.modelArtifactPath || undefined,
        performanceMetrics: Object.keys(metrics).length ? metrics : undefined,
        featureNames: features,
      } satisfies RegisterModelPayload);
      toast({
        title: 'Model registered',
        description: `${v.versionName} added to the registry.`,
      });
      onClose();
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed',
        variant: 'destructive',
      });
    }
  }
  return (
    <div className='fixed inset-0 z-40 flex justify-end'>
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />
      <div className='relative bg-white w-full max-w-lg h-full flex flex-col shadow-2xl'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50'>
          <div className='flex items-center gap-2.5'>
            <div className='p-1.5 bg-violet-100 rounded-md'>
              <Brain className='h-4 w-4 text-violet-600' />
            </div>
            <h2 className='font-semibold text-gray-900'>
              Register Model Version
            </h2>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600'
          >
            <X className='h-5 w-5' />
          </button>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex-1 overflow-y-auto px-6 py-5 space-y-5'
        >
          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2'>
              <Label className='text-sm font-medium text-gray-700'>
                Version Name *
              </Label>
              <Input
                className='mt-1 font-mono text-sm'
                placeholder='e.g. xgboost-v2.1-2026Q1'
                {...register('versionName', {
                  required: 'Required',
                  minLength: { value: 3, message: 'Min 3 chars' },
                })}
              />
              {errors.versionName && (
                <p className='text-xs text-red-500 mt-1'>
                  {errors.versionName.message}
                </p>
              )}
            </div>
            <div className='col-span-2'>
              <Label className='text-sm font-medium text-gray-700'>
                Model Type *
              </Label>
              <div className='flex flex-wrap gap-2 mt-2'>
                {(Object.keys(MODEL_TYPE_META) as ModelType[]).map(t => {
                  const meta = MODEL_TYPE_META[t];
                  const Icon = meta.icon;
                  const selected = watch('modelType') === t;
                  return (
                    <button
                      key={t}
                      type='button'
                      onClick={() =>
                        (
                          document.querySelector(
                            `input[name=modelType]`,
                          ) as HTMLInputElement
                        )?.setAttribute('value', t)
                      }
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        selected
                          ? meta.color + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className='h-3 w-3' />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
              {/* Hidden select for form value */}
              <select
                className='sr-only'
                {...register('modelType', {
                  required: 'Model type is required',
                })}
              >
                <option value=''>—</option>
                {(Object.keys(MODEL_TYPE_META) as ModelType[]).map(t => (
                  <option key={t} value={t}>
                    {MODEL_TYPE_META[t].label}
                  </option>
                ))}
              </select>
              {errors.modelType && (
                <p className='text-xs text-red-500 mt-1'>
                  {errors.modelType.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label className='text-sm font-medium text-gray-700'>
              Description
            </Label>
            <textarea
              className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring'
              rows={2}
              placeholder='What changed in this version?'
              {...register('description')}
            />
          </div>
          {/* Training window */}
          <div className='p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3'>
            <p className='text-xs font-semibold text-gray-600 uppercase tracking-wide'>
              Training Window
            </p>
            <div className='grid grid-cols-2 gap-3'>
              <div>
                <Label className='text-xs text-gray-600'>Start Date</Label>
                <Input
                  type='date'
                  className='mt-1 text-sm'
                  {...register('trainingStart')}
                />
              </div>
              <div>
                <Label className='text-xs text-gray-600'>End Date</Label>
                <Input
                  type='date'
                  className='mt-1 text-sm'
                  {...register('trainingEnd')}
                />
              </div>
            </div>
            <div>
              <Label className='text-xs text-gray-600'>
                Training Sample Size
              </Label>
              <Input
                className='mt-1 text-sm'
                type='number'
                placeholder='e.g. 45000 claims'
                {...register('trainingSampleSize')}
              />
            </div>
          </div>
          {/* Performance metrics */}
          <div className='p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3'>
            <p className='text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5'>
              <BarChart3 className='h-3.5 w-3.5' />
              Performance Metrics (0 – 1)
            </p>
            <div className='grid grid-cols-2 gap-3'>
              {(['aucRoc', 'precision', 'recall', 'f1'] as const).map(key => (
                <div key={key}>
                  <Label className='text-xs text-gray-600'>
                    {
                      {
                        aucRoc: 'AUC-ROC',
                        precision: 'Precision',
                        recall: 'Recall',
                        f1: 'F1 Score',
                      }[key]
                    }
                  </Label>
                  <Input
                    className='mt-1 text-sm font-mono'
                    type='number'
                    step='0.001'
                    min='0'
                    max='1'
                    placeholder='e.g. 0.94'
                    {...register(key)}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Artifact path */}
          <div>
            <Label className='text-sm font-medium text-gray-700'>
              Artifact Path
            </Label>
            <Input
              className='mt-1 font-mono text-sm'
              placeholder='s3://sha-models/xgboost-v2.1.joblib'
              {...register('modelArtifactPath')}
            />
            <p className='text-xs text-gray-400 mt-1'>
              S3 or MinIO path to the serialised model file.
            </p>
          </div>
          {/* Feature names */}
          <div>
            <Label className='text-sm font-medium text-gray-700'>
              Feature Names
            </Label>
            <textarea
              className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring'
              rows={3}
              placeholder='duplicate_within_7d, provider_cost_zscore, claim_amount, ...'
              {...register('featureNames')}
            />
            <p className='text-xs text-gray-400 mt-1'>
              Comma-separated. Must match training order exactly.
            </p>
          </div>
        </form>
        <div className='px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className='min-w-[140px]'
          >
            {isLoading && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
            Register Model
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Deploy Confirm ───────────────────────────────────────────────────────────

function DeployConfirm({
  model,
  onConfirm,
  onCancel,
  loading,
}: {
  model: ModelVersion;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const meta = MODEL_TYPE_META[model.modelType];
  const Icon = meta.icon;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2.5 bg-blue-50 rounded-xl'>
            <Rocket className='h-6 w-6 text-blue-600' />
          </div>
          <div>
            <h3 className='font-semibold text-gray-900'>Deploy this model?</h3>
            <p className='text-xs text-gray-500'>
              This will replace the currently deployed version
            </p>
          </div>
        </div>
        <div className='bg-gray-50 rounded-xl p-3 mb-5 space-y-1.5'>
          <div className='flex items-center gap-2'>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}
            >
              <Icon className='h-3 w-3' />
              {meta.label}
            </span>
          </div>
          <p className='text-sm font-semibold text-gray-900'>
            {model.versionName}
          </p>
          {model.performanceMetrics?.auc_roc && (
            <p className='text-xs text-gray-500'>
              AUC-ROC: {(model.performanceMetrics.auc_roc * 100).toFixed(1)}%
              {model.performanceMetrics.f1 &&
                ` · F1: ${(model.performanceMetrics.f1 * 100).toFixed(1)}%`}
            </p>
          )}
        </div>
        <p className='text-sm text-gray-600 mb-5'>
          All new claim scoring will immediately use this model version. Live
          traffic will switch instantly.
        </p>
        <div className='flex gap-3 justify-end'>
          <Button
            variant='outline'
            size='sm'
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            size='sm'
            onClick={onConfirm}
            disabled={loading}
            className='bg-blue-600 hover:bg-blue-700 text-white'
          >
            {loading && <Loader2 className='h-3.5 w-3.5 mr-1.5 animate-spin' />}
            Deploy Now
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Rules Tab ────────────────────────────────────────────────────────────────

function RulesTab() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<RuleCategory | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<FraudRule | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleMut = useToggleRule();
  const { toast } = useToast();
  const { data: rules = [], isLoading } = useRules();
  const filtered = rules.filter(r => {
    const matchCat = catFilter === 'all' || r.category === catFilter;
    const matchActive =
      activeFilter === 'all' ||
      (activeFilter === 'active' ? r.isActive : !r.isActive);
    const matchSearch =
      !search ||
      r.ruleName.toLowerCase().includes(search.toLowerCase()) ||
      (r.displayName ?? '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchActive && matchSearch;
  });
  const activeCount = rules.filter(r => r.isActive).length;
  const inactiveCount = rules.filter(r => !r.isActive).length;
  const totalWeight = rules
    .filter(r => r.isActive)
    .reduce((s, r) => s + r.weight, 0);
  async function handleToggle(rule: FraudRule) {
    try {
      const res = await toggleMut.mutateAsync(rule.id);
      toast({
        title: res.isActive ? 'Rule enabled' : 'Rule disabled',
        description: res.message,
      });
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed',
        variant: 'destructive',
      });
    }
  }
  return (
    <div className='space-y-5'>
      {/* Stats row */}
      <div className='grid grid-cols-3 gap-4'>
        {[
          {
            label: 'Active Rules',
            value: activeCount,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Inactive Rules',
            value: inactiveCount,
            color: 'text-gray-500',
            bg: 'bg-gray-50',
          },
          {
            label: 'Total Score Pool',
            value: `${totalWeight.toFixed(0)} pts`,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
        ].map(s => (
          <Card key={s.label} className='p-4 flex items-center gap-3'>
            <div
              className={`w-2 h-8 rounded-full ${s.bg} border-l-4 border-current ${s.color}`}
            />
            <div>
              <p className='text-xs text-gray-500'>{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </Card>
        ))}
      </div>
      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            className='pl-9'
            placeholder='Search rules…'
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
        <div className='flex gap-2 flex-wrap'>
          <div className='flex rounded-md border border-gray-200 overflow-hidden'>
            {(['all', 'active', 'inactive'] as const).map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${activeFilter === f ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className='flex rounded-md border border-gray-200 overflow-hidden'>
            <button
              onClick={() => setCatFilter('all')}
              className={`px-3 py-2 text-xs font-medium transition-colors ${catFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              All
            </button>
            {RULE_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() =>
                  setCatFilter(cat.value === catFilter ? 'all' : cat.value)
                }
                className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${catFilter === cat.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Rule cards */}
      {isLoading && (
        <div className='space-y-3'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='h-20 bg-gray-100 rounded-xl animate-pulse'
            />
          ))}
        </div>
      )}
      {!isLoading && filtered.length === 0 && (
        <div className='py-16 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200'>
          <Sliders className='h-10 w-10 text-gray-300 mx-auto mb-3' />
          <p className='text-gray-400 text-sm'>No rules match your filters</p>
        </div>
      )}
      <div className='space-y-2'>
        {filtered.map(rule => {
          const cat = categoryMeta(rule.category);
          const CatIcon = cat?.icon ?? Tag;
          const expanded = expandedId === rule.id;
          return (
            <div
              key={rule.id}
              className={`bg-white border rounded-xl overflow-hidden transition-shadow ${rule.isActive ? 'border-gray-200 hover:shadow-sm' : 'border-gray-100 opacity-60'}`}
            >
              {/* Row */}
              <div
                className='flex items-center gap-4 px-4 py-3.5 cursor-pointer'
                onClick={() => setExpandedId(expanded ? null : rule.id)}
              >
                {/* Category dot */}
                <div
                  className={`w-2 h-2 rounded-full flex-none ${rule.isActive ? (cat ? 'bg-current' : 'bg-gray-400') : 'bg-gray-300'}`}
                  style={{ color: cat ? undefined : undefined }}
                />
                {/* Name */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span
                      className={`text-sm font-medium ${rule.isActive ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                      {rule.displayName ?? rule.ruleName}
                    </span>
                    {cat && (
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs border font-medium ${cat.color}`}
                      >
                        <CatIcon className='h-2.5 w-2.5' />
                        {cat.label}
                      </span>
                    )}
                  </div>
                  <p className='text-xs text-gray-400 font-mono mt-0.5'>
                    {rule.ruleName}
                  </p>
                </div>
                {/* Config chip */}
                <div className='hidden md:block'>
                  <RuleConfigChip config={rule.config} />
                </div>
                {/* Weight */}
                <div className='text-right flex-none'>
                  <p className='text-sm font-bold text-gray-900'>
                    {rule.weight}
                  </p>
                  <p className='text-xs text-gray-400'>pts</p>
                </div>
                {/* Toggle */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleToggle(rule);
                  }}
                  disabled={toggleMut.isPending}
                  className={`p-1.5 rounded-md transition-colors flex-none ${rule.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  title={rule.isActive ? 'Disable rule' : 'Enable rule'}
                >
                  {toggleMut.isPending ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : rule.isActive ? (
                    <Power className='h-4 w-4' />
                  ) : (
                    <PowerOff className='h-4 w-4' />
                  )}
                </button>
                {/* Edit */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setEditTarget(rule);
                    setDrawerMode('edit');
                  }}
                  className='p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex-none'
                >
                  <Edit2 className='h-3.5 w-3.5' />
                </button>
                {/* Expand */}
                <div className='text-gray-400 flex-none'>
                  {expanded ? (
                    <ChevronUp className='h-4 w-4' />
                  ) : (
                    <ChevronDown className='h-4 w-4' />
                  )}
                </div>
              </div>
              {/* Expanded detail */}
              {expanded && (
                <div className='px-5 pb-4 pt-1 border-t border-gray-100 bg-gray-50 space-y-3'>
                  {rule.description && (
                    <p className='text-sm text-gray-600'>{rule.description}</p>
                  )}
                  <div className='md:hidden'>
                    <p className='text-xs text-gray-500 mb-1.5'>Expression:</p>
                    <RuleConfigChip config={rule.config} />
                  </div>
                  <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='text-xs text-gray-500'>Created</p>
                      <p className='font-medium text-gray-800'>
                        {formatDate(rule.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Last updated</p>
                      <p className='font-medium text-gray-800'>
                        {formatDate(rule.updatedAt)}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Field type</p>
                      <p className='font-medium text-gray-800 font-mono text-xs'>
                        {fieldMeta(rule.config.field)?.type ?? '—'}
                      </p>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Status</p>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${rule.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${rule.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}
                        />
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Drawers */}
      {drawerMode && (
        <RuleDrawer
          mode={drawerMode}
          rule={editTarget}
          onClose={() => {
            setDrawerMode(null);
            setEditTarget(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Models Tab ───────────────────────────────────────────────────────────────

function ModelsTab() {
  const [showRegister, setShowRegister] = useState(false);
  const [deployTarget, setDeployTarget] = useState<ModelVersion | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: models = [], isLoading } = useModels();
  const deployMut = useDeployModel();
  const { toast } = useToast();
  const deployed = models.find(m => m.isDeployed);
  const undeployed = models.filter(m => !m.isDeployed);
  async function handleDeploy() {
    if (!deployTarget) return;
    try {
      const res = await deployMut.mutateAsync(deployTarget.id);
      toast({ title: 'Model deployed', description: res.message });
    } catch (err: unknown) {
      toast({
        title: 'Deploy failed',
        description: err instanceof Error ? err.message : 'Error',
        variant: 'destructive',
      });
    } finally {
      setDeployTarget(null);
    }
  }

  function ModelCard({ model }: { model: ModelVersion }) {
    const meta = MODEL_TYPE_META[model.modelType];
    const Icon = meta.icon;
    const expanded = expandedId === model.id;
    const m = model.performanceMetrics;
    return (
      <div
        className={`bg-white border rounded-xl overflow-hidden transition-shadow ${
          model.isDeployed
            ? 'border-blue-300 shadow-sm ring-1 ring-blue-200'
            : 'border-gray-200 hover:shadow-sm'
        }`}
      >
        <div
          className='flex items-start gap-4 px-5 py-4 cursor-pointer'
          onClick={() => setExpandedId(expanded ? null : model.id)}
        >
          {/* Icon */}
          <div className={`p-2 rounded-lg border flex-none ${meta.color}`}>
            <Icon className='h-4 w-4' />
          </div>
          {/* Info */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='text-sm font-semibold text-gray-900 font-mono'>
                {model.versionName}
              </span>
              {model.isDeployed && (
                <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-medium'>
                  <Rocket className='h-3 w-3' />
                  Live
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs border font-medium ${meta.color}`}
              >
                {meta.label}
              </span>
            </div>
            <p className='text-xs text-gray-500 mt-0.5'>
              {model.description ?? 'No description'}
            </p>
            {/* Quick metrics row */}
            {m && (
              <div className='flex flex-wrap gap-3 mt-2'>
                {m.auc_roc !== undefined && (
                  <span className='text-xs text-gray-600'>
                    AUC <strong>{(m.auc_roc * 100).toFixed(1)}%</strong>
                  </span>
                )}
                {m.precision !== undefined && (
                  <span className='text-xs text-gray-600'>
                    P <strong>{(m.precision * 100).toFixed(1)}%</strong>
                  </span>
                )}
                {m.recall !== undefined && (
                  <span className='text-xs text-gray-600'>
                    R <strong>{(m.recall * 100).toFixed(1)}%</strong>
                  </span>
                )}
                {m.f1 !== undefined && (
                  <span className='text-xs text-gray-600'>
                    F1 <strong>{(m.f1 * 100).toFixed(1)}%</strong>
                  </span>
                )}
              </div>
            )}
          </div>
          {/* Deploy button */}
          {!model.isDeployed && (
            <button
              onClick={e => {
                e.stopPropagation();
                setDeployTarget(model);
              }}
              className='flex-none flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors'
            >
              <Rocket className='h-3.5 w-3.5' />
              Deploy
            </button>
          )}
          {model.isDeployed && (
            <div className='flex-none flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200'>
              <CheckCircle2 className='h-3.5 w-3.5' />
              Deployed
            </div>
          )}
          <div className='text-gray-400 flex-none mt-0.5'>
            {expanded ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </div>
        </div>
        {/* Expanded detail */}
        {expanded && (
          <div className='px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50 space-y-4'>
            {/* Full metrics bars */}
            {m && (
              <div className='space-y-2'>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                  Performance Metrics
                </p>
                {Object.entries(m).map(
                  ([key, val]) =>
                    val !== undefined && (
                      <div key={key}>
                        <div className='flex justify-between text-xs text-gray-600 mb-0.5'>
                          <span className='capitalize'>
                            {key.replace('_', '-')}
                          </span>
                        </div>
                        {metricBar(val)}
                      </div>
                    ),
                )}
              </div>
            )}
            {/* Training info */}
            <div className='grid grid-cols-2 gap-x-6 gap-y-2 text-sm'>
              <div>
                <p className='text-xs text-gray-500'>Training window</p>
                <p className='font-medium text-gray-800 text-xs'>
                  {formatDate(model.trainingStart)} –{' '}
                  {formatDate(model.trainingEnd)}
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-500'>Sample size</p>
                <p className='font-medium text-gray-800'>
                  {model.trainingSampleSize?.toLocaleString() ?? '—'} claims
                </p>
              </div>
              <div>
                <p className='text-xs text-gray-500'>Registered</p>
                <p className='font-medium text-gray-800'>
                  {formatDate(model.createdAt)}
                </p>
              </div>
              {model.deployedAt && (
                <div>
                  <p className='text-xs text-gray-500'>Deployed at</p>
                  <p className='font-medium text-gray-800'>
                    {formatDate(model.deployedAt)}
                  </p>
                </div>
              )}
            </div>
            {/* Artifact path */}
            {model.modelArtifactPath && (
              <div>
                <p className='text-xs text-gray-500 mb-1'>Artifact path</p>
                <code className='text-xs bg-gray-900 text-gray-200 px-2 py-1 rounded font-mono break-all'>
                  {model.modelArtifactPath}
                </code>
              </div>
            )}
            {/* Feature names */}
            {model.featureNames && model.featureNames.length > 0 && (
              <div>
                <p className='text-xs text-gray-500 mb-1.5'>
                  Features ({model.featureNames.length})
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {model.featureNames.map(f => (
                    <code
                      key={f}
                      className='text-xs bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono'
                    >
                      {f}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className='space-y-6'>
      {/* Currently deployed banner */}
      {!isLoading && deployed && (
        <div className='flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl'>
          <div className='p-2 bg-blue-600 rounded-lg'>
            <Rocket className='h-5 w-5 text-white' />
          </div>
          <div className='flex-1'>
            <p className='text-sm font-semibold text-blue-900'>Live Model</p>
            <p className='text-xs text-blue-700 font-mono'>
              {deployed.versionName}
            </p>
          </div>
          <div className='flex items-center gap-4'>
            {deployed.performanceMetrics?.auc_roc && (
              <div className='text-center'>
                <p className='text-xs text-blue-600'>AUC-ROC</p>
                <p className='text-sm font-bold text-blue-900'>
                  {(deployed.performanceMetrics.auc_roc * 100).toFixed(1)}%
                </p>
              </div>
            )}
            {deployed.performanceMetrics?.f1 && (
              <div className='text-center'>
                <p className='text-xs text-blue-600'>F1</p>
                <p className='text-sm font-bold text-blue-900'>
                  {(deployed.performanceMetrics.f1 * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      {isLoading && (
        <div className='space-y-3'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='h-24 bg-gray-100 rounded-xl animate-pulse'
            />
          ))}
        </div>
      )}
      {!isLoading && models.length === 0 && (
        <div className='py-16 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200'>
          <Bot className='h-12 w-12 text-gray-300 mx-auto mb-3' />
          <p className='text-gray-500 font-medium mb-1'>
            No model versions yet
          </p>
          <p className='text-gray-400 text-sm mb-4'>
            Register a trained model to start using it for fraud scoring
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowRegister(true)}
          >
            <Plus className='h-3.5 w-3.5 mr-1.5' />
            Register First Model
          </Button>
        </div>
      )}
      {/* Currently deployed */}
      {deployed && (
        <div className='space-y-2'>
          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide px-1'>
            Currently Deployed
          </p>
          <ModelCard model={deployed} />
        </div>
      )}
      {/* Other versions */}
      {undeployed.length > 0 && (
        <div className='space-y-2'>
          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide px-1'>
            Other Versions ({undeployed.length})
          </p>
          {undeployed.map(m => (
            <ModelCard key={m.id} model={m} />
          ))}
        </div>
      )}
      {showRegister && (
        <RegisterModelDrawer onClose={() => setShowRegister(false)} />
      )}
      {deployTarget && (
        <DeployConfirm
          model={deployTarget}
          onConfirm={handleDeploy}
          onCancel={() => setDeployTarget(null)}
          loading={deployMut.isPending}
        />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'rules' | 'models';

export default function MLEnginePage() {
  const [tab, setTab] = useState<Tab>('rules');
  const [ruleDrawerOpen, setRuleDrawerOpen] = useState(false);
  const [modelDrawerOpen, setModelDrawerOpen] = useState(false);
  const { data: rules = [] } = useRules();
  const { data: models = [] } = useModels();
  const activeRules = rules.filter(r => r.isActive).length;
  const deployedModel = models.find(m => m.isDeployed);
  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>ML Engine</h1>
            <p className='text-gray-500 mt-1 text-sm'>
              Configure fraud detection rules and manage model versions
            </p>
          </div>
          <Button
            onClick={() =>
              tab === 'rules'
                ? setRuleDrawerOpen(true)
                : setModelDrawerOpen(true)
            }
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            {tab === 'rules' ? 'New Rule' : 'Register Model'}
          </Button>
        </div>
        {/* System status bar */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <Card className='p-4 flex items-center gap-3'>
            <div className='p-2 bg-emerald-50 rounded-lg'>
              <Sliders className='h-4 w-4 text-emerald-600' />
            </div>
            <div>
              <p className='text-xs text-gray-500'>Active Rules</p>
              <p className='text-xl font-bold text-gray-900'>
                {activeRules}
                <span className='text-gray-400 text-sm font-normal'>
                  {' '}
                  / {rules.length}
                </span>
              </p>
            </div>
          </Card>
          <Card className='p-4 flex items-center gap-3'>
            <div
              className={`p-2 rounded-lg ${deployedModel ? 'bg-blue-50' : 'bg-gray-50'}`}
            >
              <Brain
                className={`h-4 w-4 ${deployedModel ? 'text-blue-600' : 'text-gray-400'}`}
              />
            </div>
            <div>
              <p className='text-xs text-gray-500'>Live Model</p>
              <p className='text-sm font-semibold text-gray-900 truncate max-w-[140px]'>
                {deployedModel ? (
                  deployedModel.versionName
                ) : (
                  <span className='text-gray-400 font-normal italic'>
                    None deployed
                  </span>
                )}
              </p>
            </div>
          </Card>
          <Card className='p-4 flex items-center gap-3'>
            <div
              className={`p-2 rounded-lg ${deployedModel?.performanceMetrics?.auc_roc ? 'bg-violet-50' : 'bg-gray-50'}`}
            >
              <BarChart3
                className={`h-4 w-4 ${deployedModel?.performanceMetrics?.auc_roc ? 'text-violet-600' : 'text-gray-400'}`}
              />
            </div>
            <div>
              <p className='text-xs text-gray-500'>Model AUC-ROC</p>
              <p className='text-xl font-bold text-gray-900'>
                {deployedModel?.performanceMetrics?.auc_roc ? (
                  `${(deployedModel.performanceMetrics.auc_roc * 100).toFixed(1)}%`
                ) : (
                  <span className='text-gray-400 text-sm font-normal italic'>
                    —
                  </span>
                )}
              </p>
            </div>
          </Card>
        </div>
        {/* Tabs */}
        <div className='border-b border-gray-200'>
          <div className='flex gap-0'>
            {(
              [
                {
                  id: 'rules',
                  label: 'Detection Rules',
                  icon: Sliders,
                  count: rules.length,
                },
                {
                  id: 'models',
                  label: 'Model Versions',
                  icon: Brain,
                  count: models.length,
                },
              ] as const
            ).map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className='h-4 w-4' />
                  {t.label}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${
                      tab === t.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Tab content */}
        {tab === 'rules' && <RulesTab />}
        {tab === 'models' && <ModelsTab />}
      </div>
      {/* Top-level drawers (triggered from page header button) */}
      {ruleDrawerOpen && (
        <RuleDrawer mode='create' onClose={() => setRuleDrawerOpen(false)} />
      )}
      {modelDrawerOpen && (
        <RegisterModelDrawer onClose={() => setModelDrawerOpen(false)} />
      )}
    </DashboardLayout>
  );
}
