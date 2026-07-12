"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  User,
  Mail,
  CheckCircle,
  XCircle,
  Inbox,
  Eye,
  CheckCheck,
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
  user: {
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-muted text-muted-foreground border-border",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  COMPLETED: {
    label: "Completed",
    className:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
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

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await api.get<Appointment[]>("/admin/appointments");
        setAppointments(response.data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleStatusChange = async (
    id: string,
    newStatus: "ACCEPTED" | "REJECTED" | "COMPLETED",
  ) => {
    setUpdatingId(id);
    try {
      await api.patch(`/admin/appointments/${id}/status`, {
        status: newStatus,
      });

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === id ? { ...appt, status: newStatus } : appt,
        ),
      );
      setSelected((prev) =>
        prev && prev.id === id ? { ...prev, status: newStatus } : prev,
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update appointment status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleView = (appointment: Appointment) => {
    setSelected(appointment);
    setIsDialogOpen(true);
  };

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

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  }

  const selectedUserName = selected?.user.profile
    ? `${selected.user.profile.firstName} ${selected.user.profile.lastName}`
    : "No Profile";
  const selectedStatus = selected ? statusConfig[selected.status] : null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Appointments
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage student appointment requests
          </p>
        </div>

        {/* Filter bar — same pattern as profile/history */}
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

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="flex flex-col items-center justify-center gap-2 py-16">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                  <Inbox className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No{" "}
                  {filter !== "ALL"
                    ? statusConfig[filter].label.toLowerCase()
                    : ""}{" "}
                  appointments found
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => {
              const status = statusConfig[appointment.status];
              const userName = appointment.user.profile
                ? `${appointment.user.profile.firstName} ${appointment.user.profile.lastName}`
                : "No Profile";
              const isUpdating = updatingId === appointment.id;

              const [apptHours, apptMinutes] = appointment.time
                .split(":")
                .map(Number);
              const timeObj = new Date();
              timeObj.setHours(apptHours, apptMinutes, 0, 0);

              return (
                <Card
                  key={appointment.id}
                  className="shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 truncate font-semibold">
                        {appointment.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0", status.className)}
                      >
                        {status.label}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium">{userName}</span>
                      <span className="hidden truncate text-muted-foreground sm:inline">
                        · {appointment.user.email}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate pl-6 text-xs text-muted-foreground sm:hidden">
                      {appointment.user.email}
                    </p>

                    <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-3">
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
                            new Date(appointment.date + "T00:00:00"),
                            "MMM d, yyyy",
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{format(timeObj, "h:mm a")}</span>
                      </div>
                    </div>

                    {appointment.description && (
                      <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-muted/50 p-2.5 text-sm text-muted-foreground">
                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p className="line-clamp-2">{appointment.description}</p>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => handleView(appointment)}
                        disabled={isUpdating}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>

                      {appointment.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(appointment.id, "ACCEPTED")
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                            {isUpdating ? "Updating…" : "Accept"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={isUpdating}
                            onClick={() =>
                              handleStatusChange(appointment.id, "REJECTED")
                            }
                          >
                            <XCircle className="h-4 w-4" />
                            {isUpdating ? "Updating…" : "Reject"}
                          </Button>
                        </>
                      )}

                      {appointment.status === "ACCEPTED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusChange(appointment.id, "COMPLETED")
                          }
                        >
                          <CheckCheck className="h-4 w-4" />
                          {isUpdating ? "Updating…" : "Mark as Completed"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Appointment detail dialog — unchanged from before */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl sm:w-full">
          {selected && selectedStatus && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-3 pr-6">
                  <DialogTitle className="text-left">
                    {selected.title}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0", selectedStatus.className)}
                  >
                    {selectedStatus.label}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <Card className="shadow-sm">
                  <CardContent className="divide-y divide-border p-0">
                    <div className="flex items-center gap-3 p-4">
                      <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Requested by
                        </p>
                        <p className="truncate text-sm font-medium">
                          {selectedUserName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4">
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="truncate text-sm font-medium">
                          {selected.user.email}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Concern
                    </div>
                    <p className="mt-1 text-sm font-medium">
                      {concernConfig[selected.concern] ?? selected.concern}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      Date
                    </div>
                    <p className="mt-1 text-sm font-medium">
                      {format(
                        new Date(selected.date + "T00:00:00"),
                        "MMM d, yyyy",
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Time
                    </div>
                    <p className="mt-1 text-sm font-medium">
                      {(() => {
                        const [h, m] = selected.time.split(":").map(Number);
                        const t = new Date();
                        t.setHours(h, m, 0, 0);
                        return format(t, "h:mm a");
                      })()}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    Description
                  </div>
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">
                    {selected.description || "No description provided."}
                  </p>
                </div>

                {selected.status === "PENDING" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 gap-1.5"
                      variant="outline"
                      disabled={updatingId === selected.id}
                      onClick={() =>
                        handleStatusChange(selected.id, "ACCEPTED")
                      }
                    >
                      <CheckCircle className="h-4 w-4" />
                      {updatingId === selected.id ? "Updating…" : "Accept"}
                    </Button>
                    <Button
                      className="flex-1 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      variant="outline"
                      disabled={updatingId === selected.id}
                      onClick={() =>
                        handleStatusChange(selected.id, "REJECTED")
                      }
                    >
                      <XCircle className="h-4 w-4" />
                      {updatingId === selected.id ? "Updating…" : "Reject"}
                    </Button>
                  </div>
                )}

                {selected.status === "ACCEPTED" && (
                  <div className="pt-2">
                    <Button
                      className="w-full gap-1.5 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                      variant="outline"
                      disabled={updatingId === selected.id}
                      onClick={() =>
                        handleStatusChange(selected.id, "COMPLETED")
                      }
                    >
                      <CheckCheck className="h-4 w-4" />
                      {updatingId === selected.id
                        ? "Updating…"
                        : "Mark as Completed"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}