"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
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
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 border-red-200",
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
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

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
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-destructive font-medium">{error}</p>
            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-8">
      <div className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <HistoryIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Appointment History
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
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
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4 px-4 text-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-lg">No appointments yet</p>
                <p className="text-muted-foreground text-sm">
                  Book your first appointment to get started
                </p>
              </div>
              <Button
                className="w-full sm:w-auto"
                onClick={() => router.push("/profile/appointment/create")}
              >
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
                  className="hover:shadow-md transition-shadow overflow-hidden"
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-stretch gap-3 sm:gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm sm:text-base truncate max-w-[180px] sm:max-w-none">
                            {appointment.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`${status.className} text-xs flex-shrink-0`}
                          >
                            {status.label}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {concernConfig[appointment.concern] ??
                              appointment.concern}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {format(
                                new Date(appointment.date),
                                "MMM d, yyyy",
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {format(new Date(appointment.date), "h:mm a")}
                            </span>
                          </div>
                        </div>

                        {appointment.description && (
                          <div className="flex items-start gap-1.5 text-xs sm:text-sm text-muted-foreground">
                            <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <p className="line-clamp-2">
                              {appointment.description}
                            </p>
                          </div>
                        )}
                      </div>

                      <div
                        className={`w-1.5 sm:w-2 rounded-full flex-shrink-0 ${
                          appointment.status === "ACCEPTED"
                            ? "bg-green-500"
                            : appointment.status === "PENDING"
                              ? "bg-orange-400"
                              : "bg-red-500"
                        }`}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
