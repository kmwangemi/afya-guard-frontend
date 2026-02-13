"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  // useEffect(() => {
  //   const validateAuth = async () => {
  //     const isAuth = await checkAuth();
  //     if (!isAuth) {
  //       router.push("/login");
  //     }
  //   };

  //   validateAuth();
  // }, []);

  // if (isLoading) {
  //   return (
  //     <div className="flex h-screen items-center justify-center">
  //       <LoadingSpinner />
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-7xl p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
