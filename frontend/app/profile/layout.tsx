"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-siderbar";
import { NotificationBell } from "@/components/notification-bell";

interface LayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: LayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
    } else if (user.role !== "USER") {
      router.replace("/admin/dashboard");
    }
  }, [loading, user, router]);

  const isAuthorized = !loading && !!user && user.role === "USER";

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
        <AppSidebar />

        <main className="flex-1 p-4 overflow-auto">
          <div className="flex justify-between gap-5 items-center mb-4">
            <SidebarTrigger />
            <NotificationBell />
          </div>

          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
