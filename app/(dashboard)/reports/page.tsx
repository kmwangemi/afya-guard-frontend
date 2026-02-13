"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Generate and manage fraud detection reports</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            New Report
          </Button>
        </div>

        {/* Placeholder */}
        <Card className="p-12">
          <EmptyState
            icon={BarChart3}
            title="Reports Management Coming Soon"
            description="Report generation, templates, scheduling, and advanced analytics will be available in the next phase."
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
