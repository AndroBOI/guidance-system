"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarClock,
  Clock,
  ChevronRight,
  CheckCircle2,
  Plus,
  Bell,
  XCircle,
} from "lucide-react";

// Types matching the Prisma schema and backend response
interface Appointment {
  id: string;
  title: string;
  concern: string;
  description: string | null;
  date: string;
  time: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!user) {
        if (isMounted) setDataLoading(false);
        return;
      }
      
      try {
        const [apptsRes, notifsRes] = await Promise.all([
          api.get<Appointment[]>("/appointments/my"),
          api.get<Notification[]>("/notifications"),
        ]);

        if (isMounted) {
          setAppointments(apptsRes.data);
          setNotifications(notifsRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setDataLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Derived state for widgets
  const stats = useMemo(() => {
    let pending = 0;
    let accepted = 0;
    let rejected = 0;

    appointments.forEach((appt) => {
      if (appt.status === "PENDING") pending++;
      else if (appt.status === "ACCEPTED") accepted++;
      else if (appt.status === "REJECTED") rejected++;
    });

    return [
      {
        label: "Accepted",
        value: accepted,
        icon: CalendarCheck,
      },
      {
        label: "Pending",
        value: pending,
        icon: Clock,
      },
      {
        label: "Rejected",
        value: rejected,
        icon: XCircle,
      },
    ];
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((appt) => appt.status === "ACCEPTED" || appt.status === "PENDING")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3);
  }, [appointments]);

  const recentActivity = useMemo(() => {
    return notifications
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5); // top 5
  }, [notifications]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = new Date().getTime() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  if (authLoading || dataLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.email?.split("@")[0] ?? "there";

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent sm:h-11 sm:w-11">
              <LayoutDashboard className="h-6 w-6 text-primary sm:h-5 sm:w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight md:text-3xl">
                Welcome back, <span className="capitalize">{firstName}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1 sm:mt-0">
                Here&apos;s what&apos;s happening with your appointments today.
              </p>
            </div>
          </div>

          <Link
            href="/profile/appointment/create"
            passHref
            className="w-full sm:w-auto mt-2 sm:mt-0"
          >
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Upcoming appointments */}
          <Card className="shadow-sm lg:col-span-2 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Appointments</CardTitle>
                <CardDescription>
                  Your latest scheduled sessions
                </CardDescription>
              </div>
              <Link
                href={"/profile/history"}
                className="text-muted-foreground flex items-center"
              >
                <Button variant="ghost">
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-1 flex-1">
              {upcomingAppointments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                  <CalendarClock className="h-8 w-8 mb-2 opacity-20" />
                  <p>No upcoming appointments</p>
                </div>
              ) : (
                upcomingAppointments.map((appt, idx) => (
                  <div key={appt.id}>
                    <div className="flex items-center gap-4 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                        <CalendarClock className="h-4 w-4 text-primary" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-medium">
                          {new Date(appt.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appt.time} - {appt.title}
                        </p>
                      </div>

                      <Badge
                        variant={getStatusBadgeVariant(appt.status)}
                        className="capitalize bg-blue-400"
                      >
                        {appt.status.toLowerCase()}
                      </Badge>
                    </div>
                    {idx < upcomingAppointments.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="shadow-sm flex flex-col">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              {recentActivity.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
                  <Bell className="h-8 w-8 mb-2 opacity-20" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
                      {item.type.includes("ACCEPTED") ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : item.type.includes("REJECTED") ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Bell className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm leading-snug">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(item.createdAt)}
                      </p>
                    </div>
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
