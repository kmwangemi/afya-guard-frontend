"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/types/alert";
import { formatDateTime, formatCurrency } from "@/lib/helpers";
import { ALERT_TYPE_LABELS } from "@/lib/constants";
import { RiskScoreBadge } from "@/components/shared/RiskScoreBadge";
import { AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

interface RecentAlertsProps {
  alerts: Alert[];
  isLoading?: boolean;
}

export function RecentAlerts({ alerts, isLoading }: RecentAlertsProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Critical Alerts</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Critical Alerts</h3>
        <div className="py-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No critical alerts at this time</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Recent Critical Alerts</h3>
        <Link href="/alerts">
          <Button variant="ghost" size="sm">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert) => (
          <Link
            key={alert.id}
            href={`/alerts/${alert.id}`}
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {alert.claimNumber}
                  </span>
                  <span className="text-xs text-gray-500">
                    {ALERT_TYPE_LABELS[alert.type]}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{alert.providerName}</p>
                <p className="text-xs text-gray-500">
                  {formatDateTime(alert.createdAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <RiskScoreBadge score={alert.riskScore} level={alert.severity} size="sm" />
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(alert.estimatedFraudAmount)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
