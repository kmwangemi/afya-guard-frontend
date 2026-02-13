import { RISK_COLORS, CLAIM_STATUS_COLORS, ALERT_STATUS_COLORS } from "./constants";
import { RiskLevel, ClaimStatus } from "@/types/claim";
import { AlertStatus } from "@/types/alert";

/**
 * Format currency to KSh with proper formatting
 */
export const formatCurrency = (amount: number, currency: string = "KSh"): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a date to readable format
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
};

/**
 * Format a date with time
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

/**
 * Mask patient ID (show only last 4 digits)
 */
export const maskPatientId = (id: string): string => {
  if (id.length <= 4) return "****";
  return "****" + id.slice(-4);
};

/**
 * Mask provider ID/NHIF number
 */
export const maskProviderId = (id: string): string => {
  if (id.length <= 4) return "****";
  return id.slice(0, 2) + "****" + id.slice(-2);
};

/**
 * Get color for risk level
 */
export const getRiskColor = (risk: RiskLevel): string => {
  return RISK_COLORS[risk] || "#6b7280";
};

/**
 * Get background color for risk level
 */
export const getRiskBgColor = (risk: RiskLevel): string => {
  return RISK_COLORS[risk] || "#6b7280";
};

/**
 * Get color for claim status
 */
export const getStatusColor = (status: ClaimStatus): string => {
  return CLAIM_STATUS_COLORS[status] || "#6b7280";
};

/**
 * Get color for alert status
 */
export const getAlertStatusColor = (status: AlertStatus): string => {
  return ALERT_STATUS_COLORS[status] || "#6b7280";
};

/**
 * Calculate days between two dates
 */
export const daysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

/**
 * Check if a string is a valid email
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Generate query params from object
 */
export const generateQueryParams = (params: Record<string, any>): string => {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      if (value instanceof Date) {
        return `${key}=${value.toISOString()}`;
      }
      return `${key}=${encodeURIComponent(String(value))}`;
    });
  return filtered.length > 0 ? "?" + filtered.join("&") : "";
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Convert snake_case to Title Case
 */
export const snakeCaseToTitleCase = (str: string): string => {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Get initial letters from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
};

/**
 * Check if number is within percentage range
 */
export const isPercentageInRange = (
  value: number,
  min: number,
  max: number
): boolean => {
  const percentage = value * 100;
  return percentage >= min && percentage <= max;
};
