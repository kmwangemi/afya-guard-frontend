"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { FolderOpen } from "lucide-react";

export default function InvestigationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Investigations</h1>
            <p className="text-gray-600 mt-1">Fraud investigation case management</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Create Investigation
          </Button>
        </div>

        {/* Placeholder */}
        <Card className="p-12">
          <EmptyState
            icon={FolderOpen}
            title="Investigations Management Coming Soon"
            description="Investigation case tracking, evidence management, and outcome documentation will be available in the next phase."
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
