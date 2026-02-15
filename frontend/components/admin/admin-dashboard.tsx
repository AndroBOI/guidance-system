"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  UserCheck,
  Clock,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import api from "@/lib/api";

interface DashboardStats {
  totalStudents: number;
  totalCounselors: number;
  pendingAppointments: number;
  completedAppointments: number;
  todayAppointments: number;
  recentReports: number;
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
      router.push("/dashboard");
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/dashboard/stats");
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

  // Mock data for demo (remove when backend is ready)
  const mockStats: DashboardStats = {
    totalStudents: 156,
    totalCounselors: 8,
    pendingAppointments: 12,
    completedAppointments: 89,
    todayAppointments: 5,
    recentReports: 23,
  };

  const displayStats = stats || mockStats;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of guidance system statistics and activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Students */}
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

          {/* Total Counselors */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Counselors
              </CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayStats.totalCounselors}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active staff members
              </p>
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Sessions
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

          {/* Pending Appointments */}
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

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card
              className="hover:shadow-lg transition-all cursor-pointer hover:border-primary"
              onClick={() => router.push("/admin/students")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Manage Students</h3>
                    <p className="text-sm text-muted-foreground">
                      View and manage student profiles
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-all cursor-pointer hover:border-primary"
              onClick={() => router.push("/admin/appointments")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <Calendar className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Appointments</h3>
                    <p className="text-sm text-muted-foreground">
                      Review and approve sessions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-all cursor-pointer hover:border-primary"
              onClick={() => router.push("/admin/reports")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Reports</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate system reports
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-all cursor-pointer hover:border-primary"
              onClick={() => router.push("/admin/counselors")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Counselors</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage counselor accounts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-all cursor-pointer hover:border-primary"
              onClick={() => router.push("/admin/analytics")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-cyan-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      View detailed statistics
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-lg transition-all cursor-pointer hover:border-primary"
              onClick={() => router.push("/admin/settings")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-500/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">System Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure system preferences
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity Summary */}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Recent Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Generated this week
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold">
                {displayStats.recentReports}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
