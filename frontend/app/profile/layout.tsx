"use client";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }


  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <nav className="w-full bg-primary p-4 text-white flex justify-between items-center">
        <span>Profile - {user.email}</span>
        <Button variant="destructive"
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </Button>
      </nav>

      <main className="flex-1 p-4 overflow-auto">{children}</main>
    </div>
  );
}
