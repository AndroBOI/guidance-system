"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  UserPlus,
  BarChart3,
  ClipboardList,
  Inbox,
} from "lucide-react";
import { format } from "date-fns";
import api from "@/lib/api";


interface DashboardStats {
  totalStudents: number;
  pendingAppointments: number;
  completedAppointments: number;
  todayAppointments: number;
}

interface Appointment {
  id: string;
  title: string;
  date: string;   
  time: string;  
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  user: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    } | null;
  };
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Appointment[]>([]);
  const [recentSignups, setRecentSignups] = useState<UserRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (!authLoading && user?.role !== "ADMIN") {
      router.push("/profile/dashboard");
      return;
    }

    if (user?.role !== "ADMIN") return;

    const fetchAll = async () => {
      setLoading(true);
      setStatsError(false);

      const todayStr = format(new Date(), "yyyy-MM-dd");

      const [statsResult, appointmentsResult, usersResult] = await Promise.allSettled([
        api.get<DashboardStats>("/admin/dashboard/stats"),
        api.get<Appointment[]>("/admin/appointments"),
        api.get<UserRecord[]>("/admin/users"),
      ]);

      // Stats
      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value.data);
      } else {
        console.error("Error fetching stats:", statsResult.reason);
        setStatsError(true);
      }

      // Appointments → pending list + today's schedule
      if (appointmentsResult.status === "fulfilled") {
        const all = appointmentsResult.value.data;

        const pending = all
          .filter((a) => a.status === "PENDING")
          .slice(0, 5);
        setPendingAppointments(pending);

        const today = all
          .filter((a) => a.date === todayStr && a.status !== "REJECTED")
          .sort((a, b) => a.time.localeCompare(b.time));
        setTodaySchedule(today);
      } else {
        console.error("Error fetching appointments:", appointmentsResult.reason);
      }

      // Users → recent signups (already sorted desc by backend)
      if (usersResult.status === "fulfilled") {
        setRecentSignups(usersResult.value.data.slice(0, 5));
      } else {
        console.error("Error fetching users:", usersResult.reason);
      }

      setLoading(false);
    };

    fetchAll();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  }

  const firstName = user?.email?.split("@")[0] ?? "Admin";

  // Helper: get display name from an appointment's user
  const getStudentName = (appt: Appointment) => {
    const p = appt.user?.profile;
    if (p?.firstName || p?.lastName) {
      return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim();
    }
    return appt.user?.email ?? "Unknown";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back, <span className="capitalize">{firstName}</span>
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Here's what's happening across the system today.
          </p>
        </div>

        {/* Stats error banner */}
        {statsError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Could not load statistics. Please refresh the page.
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card className="shadow-sm border-primary/30 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                Pending Requests
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <AlertCircle className="h-3.5 w-3.5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-primary sm:text-2xl">
                {statsError ? "—" : (stats?.pendingAppointments ?? 0)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                Today's Sessions
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
                <Clock className="h-3.5 w-3.5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold sm:text-2xl">
                {statsError ? "—" : (stats?.todayAppointments ?? 0)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                Total Users
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
                <Users className="h-3.5 w-3.5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold sm:text-2xl">
                {statsError ? "—" : (stats?.totalStudents ?? 0)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Registered in system
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                Completed
              </CardTitle>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
                <Calendar className="h-3.5 w-3.5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold sm:text-2xl">
                {statsError ? "—" : (stats?.completedAppointments ?? 0)}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Needs attention — pending requests */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Needs Your Attention</CardTitle>
                <CardDescription>Pending appointment requests</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => router.push("/admin/appointments")}
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {pendingAppointments.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                    <Inbox className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nothing pending — you're all caught up
                  </p>
                </div>
              ) : (
                pendingAppointments.map((appt, idx) => (
                  <div key={appt.id}>
                    <div className="flex items-center gap-3 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                        <AlertCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {appt.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {getStudentName(appt)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 bg-muted text-muted-foreground border-border"
                      >
                        Pending
                      </Badge>
                    </div>
                    {idx < pendingAppointments.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
              <CardDescription>Jump to a section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="h-auto w-full justify-start gap-3 p-3"
                onClick={() => router.push("/admin/appointments")}
              >
                <ClipboardList className="h-4 w-4 text-primary" />
                <span className="text-sm">Review Appointments</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto w-full justify-start gap-3 p-3"
                onClick={() => router.push("/admin/users")}
              >
                <UserPlus className="h-4 w-4 text-primary" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto w-full justify-start gap-3 p-3"
                onClick={() => router.push("/admin/analytics")}
              >
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm">View Analytics</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Today's schedule */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Today's Schedule</CardTitle>
              <CardDescription>
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {todaySchedule.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No sessions scheduled for today
                  </p>
                </div>
              ) : (
                todaySchedule.map((appt, idx) => {
                  // Parse "HH:mm" safely without timezone shifting
                  const [hours, minutes] = appt.time.split(":").map(Number);
                  const timeObj = new Date();
                  timeObj.setHours(hours, minutes, 0, 0);

                  return (
                    <div key={appt.id}>
                      <div className="flex items-center gap-3 py-3">
                        <div className="w-14 shrink-0 text-sm font-medium text-muted-foreground">
                          {format(timeObj, "h:mm a")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {appt.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {getStudentName(appt)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            appt.status === "ACCEPTED"
                              ? "shrink-0 bg-primary/10 text-primary border-primary/20"
                              : "shrink-0 bg-muted text-muted-foreground border-border"
                          }
                        >
                          {appt.status === "ACCEPTED" ? "Confirmed" : "Pending"}
                        </Badge>
                      </div>
                      {idx < todaySchedule.length - 1 && <Separator />}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Recent signups */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Recent Signups</CardTitle>
              <CardDescription>Newest registered students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentSignups.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No Users registered yet
                  </p>
                </div>
              ) : (
                recentSignups.map((signup, idx) => (
                  <div key={signup.id}>
                    <div className="flex items-center gap-3 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {signup.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {signup.email}
                        </p>
                      </div>
                    </div>
                    {idx < recentSignups.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}