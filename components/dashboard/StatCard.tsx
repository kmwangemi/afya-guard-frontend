"use client";

import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  change?: {
    value: number;
    trend: "up" | "down";
  };
  color?: "blue" | "red" | "green" | "orange" | "purple";
}

const colorStyles = {
  blue: "bg-blue-50 text-blue-600",
  red: "bg-red-50 text-red-600",
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-purple-50 text-purple-600",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  color = "blue",
}: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change && (
            <p
              className={`text-xs mt-2 ${
                change.trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {change.trend === "up" ? "↑" : "↓"} {change.value}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
