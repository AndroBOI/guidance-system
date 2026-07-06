"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Clock, AlertCircle } from "lucide-react";
import api from "@/lib/api";

interface DashboardStats {
  totalStudents: number;
  pendingAppointments: number;
  completedAppointments: number;
  todayAppointments: number;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (!authLoading && user?.role !== "ADMIN") {
      router.push("/profile/dashboard");
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get<DashboardStats>(
          "/admin/dashboard/stats",
        );
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "ADMIN") {
      fetchStats();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  }

  const mockStats: DashboardStats = {
    totalStudents: 156,
    pendingAppointments: 12,
    completedAppointments: 89,
    todayAppointments: 5,
  };

  const displayStats = stats || mockStats;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="w-full space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayStats.totalStudents}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered in system
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today&apos;s Sessions
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayStats.todayAppointments}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Requests
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayStats.pendingAppointments}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Completed Appointments</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
              </div>
              <span className="text-2xl font-bold">
                {displayStats.completedAppointments}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
