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

type AppointmentStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";

interface Appointment {
  id: string;
  title: string;
  concern: string;
  description?: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  createdAt: string;
}

const statusConfig: Record<AppointmentStatus, { label: string; badgeClassName: string; barClassName: string }> = {
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
  COMPLETED: {
    label: "Completed",
    badgeClassName:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    barClassName: "bg-emerald-500",
  },
};

const concernConfig: Record<string, string> = {
  ACADEMIC: "Academic",
  PERSONAL: "Personal",
  HEALTH: "Health",
  CAREER: "Career",
  OTHER: "Other",
};

type FilterValue = "ALL" | AppointmentStatus;

const filters: { label: string; value: FilterValue }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterValue>("ALL");

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

  const counts: Record<FilterValue, number> = {
    ALL: appointments.length,
    PENDING: appointments.filter((a) => a.status === "PENDING").length,
    ACCEPTED: appointments.filter((a) => a.status === "ACCEPTED").length,
    COMPLETED: appointments.filter((a) => a.status === "COMPLETED").length,
    REJECTED: appointments.filter((a) => a.status === "REJECTED").length,
  };

  const filteredAppointments =
    filter === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === filter);

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
        <>
          {/* Filter bar — horizontally scrollable on mobile so it never wraps or squishes */}
          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
            <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
              {filters.map((f) => (
                <Button
                  key={f.value}
                  size="sm"
                  variant={filter === f.value ? "default" : "outline"}
                  onClick={() => setFilter(f.value)}
                  className="shrink-0 gap-1.5"
                >
                  {f.label}
                  <span
                    className={cn(
                      "text-xs",
                      filter === f.value
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {counts[f.value]}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center gap-2 py-12">
                  <p className="text-sm text-muted-foreground">
                    No{" "}
                    {filter !== "ALL"
                      ? statusConfig[filter].label.toLowerCase()
                      : ""}{" "}
                    appointments
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAppointments.map((appointment) => {
                const status = statusConfig[appointment.status];
                return (
                  <Card
                    key={appointment.id}
                    className="overflow-hidden shadow-sm transition-shadow hover:shadow-md py-0"
                  >
                    <CardContent className="flex gap-4 p-0">
                      <div
                        className={cn("w-1.5 shrink-0", status.barClassName)}
                      />

                      <div className="min-w-0 flex-1 space-y-3 py-4 pr-4 sm:py-5 sm:pr-5">
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
                              {format(
                                new Date(appointment.date),
                                "MMM d, yyyy",
                              )}
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
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}