"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, isAdmin } from "@/lib/auth";
import Header from "@/components/layout/Header";
import PageBackground from "@/components/ui/PageBackground";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    } else if (!isAdmin()) {
      router.push("/client/dashboard");
    }
  }, [router]);

  if (!isAuthenticated() || !isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface relative">
      <PageBackground />
      <div className="relative z-10">
        <Header />
        <main className="px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
