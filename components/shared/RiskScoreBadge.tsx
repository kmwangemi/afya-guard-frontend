'use client';

import { getRiskBgColor, getRiskColor } from '@/lib/helpers';
import { cn } from '@/lib/utils';

// Fix 1: widened from RiskLevel only to accept AlertSeverity values too.
// Backend RiskLevel:     LOW | MEDIUM | HIGH | CRITICAL   (claim scores)
// Backend AlertSeverity: INFO | WARNING | HIGH | CRITICAL (alert badges)
// Both flow through this component so the prop accepts the union.
type BadgeLevel = 'low' | 'medium' | 'high' | 'critical' | 'info' | 'warning';

interface RiskScoreBadgeProps {
  score: number;
  level: BadgeLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  // Fix 2: hideScore was used in AlertsPage but not declared — added here
  hideScore?: boolean;
}

// Normalise AlertSeverity → RiskLevel for colour helpers
// INFO/WARNING map to "low"/"medium" so they still get a sensible colour
function normaliseLevel(
  level: BadgeLevel,
): 'low' | 'medium' | 'high' | 'critical' {
  switch (level) {
    case 'info':
      return 'low';
    case 'warning':
      return 'medium';
    default:
      return level as 'low' | 'medium' | 'high' | 'critical';
  }
}

// Label shown next to the score — capitalised display string
const LEVEL_LABELS: Record<BadgeLevel, string> = {
  info: 'Info',
  warning: 'Warning',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export function RiskScoreBadge({
  score,
  level,
  size = 'md',
  showLabel = true,
  hideScore = false,
}: RiskScoreBadgeProps) {
  const normLevel = normaliseLevel(level);
  const color = getRiskColor(normLevel);
  const bgColor = getRiskBgColor(normLevel);
  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }[size];
  return (
    <div
      className={cn(
        'rounded-full font-semibold inline-flex items-center gap-1',
        sizeClass,
      )}
      style={{ backgroundColor: bgColor, color }}
    >
      {!hideScore && <span className='font-bold'>{score}</span>}
      {showLabel && <span>{LEVEL_LABELS[level]}</span>}
    </div>
  );
}
