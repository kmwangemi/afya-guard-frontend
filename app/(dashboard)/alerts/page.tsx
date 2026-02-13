"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bell } from "lucide-react";

export default function AlertsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
            <p className="text-gray-600 mt-1">Monitor fraud detection alerts and notifications</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            New Alert
          </Button>
        </div>

        {/* Placeholder */}
        <Card className="p-12">
          <EmptyState
            icon={Bell}
            title="Alerts Management Coming Soon"
            description="Alert management, filtering, and assignment features will be available in the next phase."
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
