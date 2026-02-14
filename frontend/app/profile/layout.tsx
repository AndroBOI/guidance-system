"use client";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-siderbar";

interface LayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: LayoutProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (!loading && !user) {
    router.push("/login");
    return null;
  }
  if (loading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <SidebarProvider>
        <AppSidebar/>
        <main className="flex-1 p-4 overflow-auto">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
