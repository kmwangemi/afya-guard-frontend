"use client";

import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Bell,
  FolderOpen,
  BarChart3,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "view_claims",
  },
  {
    title: "Claims",
    href: "/claims",
    icon: FileText,
    permission: "view_claims",
  },
  {
    title: "Providers",
    href: "/providers",
    icon: Building2,
    permission: "view_claims",
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: Bell,
    permission: "view_alerts",
  },
  {
    title: "Investigations",
    href: "/investigations",
    icon: FolderOpen,
    permission: "create_investigation",
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    permission: "view_reports",
  },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => !user || user.permissions.includes(item.permission)
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Nav items */}
          <nav className="flex-1 space-y-1 p-4">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span>Collapse</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
