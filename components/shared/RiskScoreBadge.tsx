'use client';

import { getRiskBgColor, getRiskColor } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type BadgeLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'INFO' | 'WARNING';

interface RiskScoreBadgeProps {
  score: number;
  level: BadgeLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  hideScore?: boolean;
}

function normaliseLevel(
  level: BadgeLevel,
): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  switch (level) {
    case 'INFO':
      return 'LOW';
    case 'WARNING':
      return 'MEDIUM';
    default:
      return level as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }
}

const LEVEL_LABELS: Record<BadgeLevel, string> = {
  INFO: 'Info',
  WARNING: 'Warning',
  LOW: 'Low Risk',
  MEDIUM: 'Medium Risk',
  HIGH: 'High Risk',
  CRITICAL: 'Critical Risk',
};

const LEVEL_DESCRIPTIONS: Record<BadgeLevel, string> = {
  INFO: 'Informational — no immediate action required',
  WARNING: 'Warrants attention — review when possible',
  LOW: 'Score 0–30 — low probability of fraud',
  MEDIUM: 'Score 31–60 — elevated indicators present',
  HIGH: 'Score 61–89 — strong fraud indicators detected',
  CRITICAL: 'Score 90–100 — immediate review required',
};

// Short labels for inside the badge pill (no "Risk" suffix)
const LEVEL_SHORT: Record<BadgeLevel, string> = {
  INFO: 'Info',
  WARNING: 'Warning',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export function RiskScoreBadge({
  score,
  level,
  size = 'md',
  showLabel = true,
  hideScore = false,
}: RiskScoreBadgeProps) {
  const [hovered, setHovered] = useState(false);

  const normLevel = normaliseLevel(level);
  const color = getRiskColor(normLevel);
  const bgColor = getRiskBgColor(normLevel);

  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }[size];

  const tooltipWidth = {
    sm: 'min-w-[160px]',
    md: 'min-w-[190px]',
    lg: 'min-w-[210px]',
  }[size];

  return (
    <div
      className='relative inline-flex'
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Badge pill ── */}
      <div
        className={cn(
          'rounded-full font-semibold inline-flex items-center gap-1',
          'cursor-default select-none transition-shadow duration-150',
          sizeClass,
          hovered && 'shadow-md',
        )}
        style={{ backgroundColor: bgColor, color }}
      >
        {!hideScore && <span className='font-bold'>{score}</span>}
        {showLabel && <span>{LEVEL_SHORT[level]}</span>}
      </div>
      {/* ── Tooltip ── */}
      {hovered && (
        <div
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50',
            'rounded-xl shadow-xl overflow-hidden',
            'border border-gray-100',
            tooltipWidth,
            'pointer-events-none',
          )}
          style={{ backgroundColor: '#fff' }}
        >
          {/* Coloured header */}
          <div
            className='px-3 py-2.5 flex items-center gap-2'
            style={{ backgroundColor: bgColor }}
          >
            <span
              className='h-2 w-2 rounded-full flex-shrink-0'
              style={{ backgroundColor: color }}
            />
            <span className='font-semibold text-xs' style={{ color }}>
              {LEVEL_LABELS[level]}
            </span>
            {!hideScore && (
              <span
                className='ml-auto font-bold text-xs tabular-nums'
                style={{ color }}
              >
                {score} / 100
              </span>
            )}
          </div>
          {/* Description */}
          <p className='px-3 py-2 text-xs text-gray-500 leading-snug'>
            {LEVEL_DESCRIPTIONS[level]}
          </p>
          {/* Arrow pointing down */}
          <div
            className='absolute left-1/2 -translate-x-1/2 -bottom-[5px]
                       w-2.5 h-2.5 rotate-45
                       border-r border-b border-gray-100'
            style={{ backgroundColor: '#fff' }}
          />
        </div>
      )}
    </div>
  );
}
