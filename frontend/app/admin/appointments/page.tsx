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
  user: {
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

const statusConfig = {
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
};

const concernConfig: Record<string, string> = {
  ACADEMIC: "Academic",
  PERSONAL: "Personal",
  HEALTH: "Health",
  CAREER: "Career",
  OTHER: "Other",
};

const filters = [
  { label: "All", value: "ALL" as const },
  { label: "Pending", value: "PENDING" as const },
  { label: "Accepted", value: "ACCEPTED" as const },
  { label: "Rejected", value: "REJECTED" as const },
];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "REJECTED">("ALL");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    newStatus: "ACCEPTED" | "REJECTED",
  ) => {
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
    }
  };

  const handleView = (appointment: Appointment) => {
    setSelected(appointment);
    setIsDialogOpen(true);
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

        {/* Filter Buttons — horizontally scrollable on mobile so it never wraps */}
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:overflow-visible sm:px-0">
          <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
            {filters.map((f) => (
              <Button
                key={f.value}
                size="sm"
                variant={filter === f.value ? "default" : "outline"}
                onClick={() => setFilter(f.value)}
                className="shrink-0"
              >
                {f.label}
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
                  No appointments found
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => {
              const status = statusConfig[appointment.status];
              const userName = appointment.user.profile
                ? `${appointment.user.profile.firstName} ${appointment.user.profile.lastName}`
                : "No Profile";

              return (
                <Card
                  key={appointment.id}
                  className="shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-4 sm:p-5">
                    {/* Title + status */}
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

                    {/* User */}
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

                    {/* Meta grid — stacks on mobile, 3 cols from sm */}
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
                      <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-muted/50 p-2.5 text-sm text-muted-foreground">
                        <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p className="line-clamp-2">
                          {appointment.description}
                        </p>
                      </div>
                    )}

                    <Separator className="my-4" />

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5 sm:flex-none"
                        onClick={() => handleView(appointment)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>

                      {appointment.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1.5 sm:flex-none"
                            onClick={() =>
                              handleStatusChange(appointment.id, "ACCEPTED")
                            }
                          >
                            <CheckCircle className="h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none"
                            onClick={() =>
                              handleStatusChange(appointment.id, "REJECTED")
                            }
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Appointment detail dialog */}
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
                {/* Requester */}
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

                {/* Schedule + concern */}
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
                      {format(new Date(selected.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Time
                    </div>
                    <p className="mt-1 text-sm font-medium">
                      {format(new Date(selected.date), "h:mm a")}
                    </p>
                  </div>
                </div>

                {/* Full description, no truncation */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    Description
                  </div>
                  <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm leading-relaxed">
                    {selected.description || "No description provided."}
                  </p>
                </div>

                {/* Actions inside the modal too */}
                {selected.status === "PENDING" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 gap-1.5"
                      variant="outline"
                      onClick={() =>
                        handleStatusChange(selected.id, "ACCEPTED")
                      }
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      className="flex-1 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      variant="outline"
                      onClick={() =>
                        handleStatusChange(selected.id, "REJECTED")
                      }
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
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