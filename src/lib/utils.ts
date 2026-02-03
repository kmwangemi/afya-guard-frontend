import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDatetime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getRiskLevelColor(level: string): string {
  switch (level) {
    case 'CRITICAL':
      return 'text-red-600 bg-red-50';
    case 'HIGH':
      return 'text-orange-600 bg-orange-50';
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-50';
    case 'LOW':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getRiskLevelBadgeColor(level: string): string {
  switch (level) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function calculateRiskScore(
  flags: Array<{ severity: string; score: number }>,
): number {
  if (!flags || flags.length === 0) return 0;
  return Math.min(
    100,
    (flags.reduce((sum, flag) => sum + (flag.score || 0), 0) / flags.length) *
      100,
  );
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'flagged_critical':
      return 'bg-red-100 text-red-800';
    case 'flagged_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'auto_approved':
      return 'bg-green-100 text-green-800';
    case 'approved':
      return 'bg-blue-100 text-blue-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
    case 'processing':
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
