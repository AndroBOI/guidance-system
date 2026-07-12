"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

interface LayoutProps {
  children: ReactNode;
}

export default function CreateLayout({ children }: LayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
    } else if (user.role === "ADMIN") {
      router.replace("/admin/dashboard");
    } else if (user.hasProfile) {
      router.replace("/profile/dashboard");
    }
  }, [loading, user, router]);

  // Show spinner while:
  // - auth is still resolving (loading)
  // - user is not yet known (null during the redirect window)
  // - user has a profile or is admin (mid-redirect)
  const isAuthorized =
    !loading && !!user && user.role === "USER" && !user.hasProfile;

  if (!isAuthorized) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
