// app/dashboard/page.tsx
"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div className="h-screen flex justify-center items-center"><Spinner className="size-20 text-primary"/></div>;
  if (!user) return null;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.email}</p>
      <p>Role: {user.role}</p>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
