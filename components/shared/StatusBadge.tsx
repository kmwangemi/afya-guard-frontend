"use client";

import { ClaimStatus } from "@/types/claim";
import { AlertStatus } from "@/types/alert";
import { InvestigationStatus } from "@/types/investigation";
import {
  CLAIM_STATUS_COLORS,
  ALERT_STATUS_COLORS,
  INVESTIGATION_STATUS_COLORS,
  CLAIM_STATUS_LABELS,
  ALERT_STATUS_LABELS,
  INVESTIGATION_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type Status = ClaimStatus | AlertStatus | InvestigationStatus;

interface StatusBadgeProps {
  status: Status;
  type?: "claim" | "alert" | "investigation";
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, type = "claim", size = "sm" }: StatusBadgeProps) {
  let color = "#6b7280";
  let label = status;

  if (type === "claim") {
    color = CLAIM_STATUS_COLORS[status as ClaimStatus];
    label = CLAIM_STATUS_LABELS[status as ClaimStatus];
  } else if (type === "alert") {
    color = ALERT_STATUS_COLORS[status as AlertStatus];
    label = ALERT_STATUS_LABELS[status as AlertStatus];
  } else if (type === "investigation") {
    color = INVESTIGATION_STATUS_COLORS[status as InvestigationStatus];
    label = INVESTIGATION_STATUS_LABELS[status as InvestigationStatus];
  }

  const sizeClass = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  }[size];

  const bgColor = color + "20"; // Add transparency

  return (
    <div
      className={cn("rounded-full font-medium inline-block", sizeClass)}
      style={{ backgroundColor: bgColor, color: color }}
    >
      {label}
    </div>
  );
}
