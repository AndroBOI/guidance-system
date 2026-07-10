"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
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
} from "lucide-react";

// ---- Placeholder data — swap for real queries later ----
const stats = [
  {
    label: "Upcoming",
    value: 4,
    icon: CalendarClock,
  },
  {
    label: "Completed",
    value: 28,
    icon: CheckCircle2,
  },
  {
    label: "Pending",
    value: 2,
    icon: Clock,
  },
];

const upcomingAppointments = [
  {
    id: 1,
    date: "Today",
    time: "2:00 PM – 2:45 PM",
    status: "confirmed",
  },
  {
    id: 2,
    date: "Tomorrow",
    time: "10:00 AM – 10:30 AM",
    status: "confirmed",
  },
  {
    id: 3,
    date: "Fri, Jul 17",
    time: "1:00 PM – 1:45 PM",
    status: "pending",
  },
];

const recentActivity = [
  {
    id: 1,
    text: "Appointment marked as completed",
    time: "2 hours ago",
    icon: CheckCircle2,
  },
  {
    id: 2,
    text: "Appointment confirmed for Jul 17",
    time: "Yesterday",
    icon: CalendarCheck,
  },
  {
    id: 3,
    text: "Appointment request submitted",
    time: "Yesterday",
    icon: Clock,
  },
];

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Welcome back, <span className="capitalize">{firstName}</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Here's what's happening with your appointments today.
              </p>
            </div>
          </div>

          <Button>
            <Plus className="h-4 w-4" />
            Book Appointment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
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
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled sessions</CardDescription>
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
            <CardContent className="space-y-1">
              {upcomingAppointments.map((appt, idx) => (
                <div key={appt.id}>
                  <div className="flex items-center gap-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                      <CalendarClock className="h-4 w-4 text-primary" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{appt.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {appt.time}
                      </p>
                    </div>

                    <Badge
                      variant={
                        appt.status === "confirmed" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {appt.status}
                    </Badge>
                  </div>
                  {idx < upcomingAppointments.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm leading-snug">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
