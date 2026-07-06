"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: LayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
    } else if (user.role !== "ADMIN") {
      router.replace("/profile/dashboard");
    }
  }, [loading, user, router]);

  const isAuthorized = !loading && !!user && user.role === "ADMIN";

  if (!isAuthorized) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <SidebarProvider>
        <AdminSidebar />
        <main className="flex-1 p-4 overflow-auto">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
