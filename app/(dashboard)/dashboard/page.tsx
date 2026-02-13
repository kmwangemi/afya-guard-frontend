"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { CountyHeatmap } from "@/components/dashboard/CountyHeatmap";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { Button } from "@/components/ui/button";
import { mockDashboardService } from "@/services/mockDashboardService";
import { DashboardStats, TrendData, CountyFraudData } from "@/types/common";
import { Alert } from "@/types/alert";
import { BarChart3, AlertTriangle, TrendingUp, Shield } from "lucide-react";
import { RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/helpers";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [countyData, setCountyData] = useState<CountyFraudData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, trends, counties, alertsList] = await Promise.all([
        mockDashboardService.getStats(),
        mockDashboardService.getTrendData(),
        mockDashboardService.getCountyFraudData(),
        mockDashboardService.getCriticalAlerts(10),
      ]);

      setStats(statsData);
      setTrendData(trends);
      setCountyData(counties);
      setAlerts(alertsList);
    } catch (error) {
      console.error("[v0] Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Healthcare fraud detection overview</p>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Claims Processed"
            value={stats?.totalClaimsProcessed ?? 0}
            icon={BarChart3}
            color="blue"
            change={{ value: 12, trend: "up" }}
          />
          <StatCard
            title="Flagged Claims"
            value={stats?.flaggedClaims ?? 0}
            icon={AlertTriangle}
            color="red"
            change={{ value: 8, trend: "up" }}
          />
          <StatCard
            title="Critical Alerts"
            value={stats?.criticalAlerts ?? 0}
            icon={TrendingUp}
            color="orange"
            change={{ value: 3, trend: "down" }}
          />
          <StatCard
            title="Fraud Prevented"
            value={formatCurrency(stats?.estimatedFraudPrevented ?? 0)}
            icon={Shield}
            color="green"
            change={{ value: 25, trend: "up" }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrendChart data={trendData} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-1">
            {/* Risk Distribution - Placeholder */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Risk Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Critical</span>
                    <span className="text-sm font-medium">847 (2.8%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: "28%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">High</span>
                    <span className="text-sm font-medium">3,245 (12.3%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{ width: "123%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Medium</span>
                    <span className="text-sm font-medium">6,547 (24.8%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: "248%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Low</span>
                    <span className="text-sm font-medium">15,928 (60.1%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* County Heatmap */}
        <CountyHeatmap data={countyData} isLoading={isLoading} />

        {/* Recent Alerts */}
        <RecentAlerts alerts={alerts} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
