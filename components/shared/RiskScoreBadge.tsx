"use client";

import { RiskLevel } from "@/types/claim";
import { getRiskColor, getRiskBgColor } from "@/lib/helpers";
import { cn } from "@/lib/utils";

interface RiskScoreBadgeProps {
  score: number;
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function RiskScoreBadge({
  score,
  level,
  size = "md",
  showLabel = true,
}: RiskScoreBadgeProps) {
  const color = getRiskColor(level);
  const bgColor = getRiskBgColor(level);

  const sizeClass = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  }[size];

  const label = level.charAt(0).toUpperCase() + level.slice(1);

  return (
    <div
      className={cn(
        "rounded-full font-semibold inline-flex items-center gap-1",
        sizeClass
      )}
      style={{ backgroundColor: bgColor, color: color }}
    >
      <span className="font-bold">{score}</span>
      {showLabel && <span>{label}</span>}
    </div>
  );
}
