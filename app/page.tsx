"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function Page() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();

  // useEffect(() => {
  //   const authenticate = async () => {
  //     const isAuth = await checkAuth();
  //     if (isAuth) {
  //       router.push("/dashboard");
  //     } else {
  //       router.push("/login");
  //     }
  //   };

  //   authenticate();
  // }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <LoadingSpinner text="Loading..." />
    </div>
  );
}
