"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/page-loader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  History as HistoryIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface Appointment {
  id: string;
  title: string;
  concern: string;
  description?: string;
  date: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    badgeClassName: "bg-muted text-muted-foreground border-border",
    barClassName: "bg-muted-foreground/40",
  },
  ACCEPTED: {
    label: "Accepted",
    badgeClassName: "bg-primary/10 text-primary border-primary/20",
    barClassName: "bg-primary",
  },
  REJECTED: {
    label: "Rejected",
    badgeClassName: "bg-destructive/10 text-destructive border-destructive/20",
    barClassName: "bg-destructive",
  },
};

const concernConfig: Record<string, string> = {
  ACADEMIC: "Academic",
  PERSONAL: "Personal",
  HEALTH: "Health",
  CAREER: "Career",
  OTHER: "Other",
};

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await api.get<Appointment[]>("/appointments/my");

        setAppointments(response.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAppointments();
  }, [user]);

  if (loading) {
    return <PageLoader fullScreen={false} />;
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center p-4">
        <Card className="w-full max-w-md shadow-sm">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-destructive font-medium">{error}</p>
            <Button onClick={() => router.push("/profile/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
            <HistoryIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Appointment History
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              View all your past and upcoming appointments
            </p>
          </div>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => router.push("/profile/appointment/create")}
        >
          New Appointment
        </Button>
      </div>

      {appointments.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1 text-center">
              <p className="text-lg font-semibold">No appointments yet</p>
              <p className="text-sm text-muted-foreground">
                Book your first appointment to get started
              </p>
            </div>
            <Button onClick={() => router.push("/profile/appointment/create")}>
              Book an Appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => {
            const status = statusConfig[appointment.status];
            return (
              <Card
                key={appointment.id}
                className="overflow-hidden shadow-sm transition-shadow hover:shadow-md py-0"
              >
                <CardContent className="flex gap-4 p-0">
                  {/* Status bar replaces the old inline colored div */}
                  <div className={cn("w-1.5 shrink-0", status.barClassName)} />

                  <div className="min-w-0 flex-1 space-y-3 py-4 pr-4 sm:py-5 sm:pr-5">
                    {/* Title + badge */}
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 truncate font-semibold">
                        {appointment.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0", status.badgeClassName)}
                      >
                        {status.label}
                      </Badge>
                    </div>

                    {/* Meta grid — stacks on mobile, 3 cols from sm */}
                    <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-3">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {concernConfig[appointment.concern] ??
                            appointment.concern}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {format(new Date(appointment.date), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {format(new Date(appointment.date), "h:mm a")}
                        </span>
                      </div>
                    </div>

                    {appointment.description && (
                      <div className="flex items-start gap-1.5 rounded-lg bg-muted/50 p-2.5 text-sm text-muted-foreground">
                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p className="line-clamp-2">
                          {appointment.description}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}