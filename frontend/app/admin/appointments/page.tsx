"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: string;
  title: string;
  concern: string;
  description?: string;
  date: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  user: {
    name: string;
    email: string;
  };
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

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    title: "Academic Advising Session",
    concern: "ACADEMIC",
    description: "Need help choosing courses for next semester",
    date: new Date(2026, 1, 20, 9, 0).toISOString(),
    status: "PENDING",
    user: {
      name: "LeBron James",
      email: "lebornJames@nba.com",
    },
  },
  {
    id: "2",
    title: "Career Guidance",
    concern: "CAREER",
    description: "Want to discuss career paths after graduation",
    date: new Date(2026, 1, 20, 10, 0).toISOString(),
    status: "PENDING",
    user: {
      name: "Steph Curry",
      email: "stephCurry@gsw.com",
    },
  },
  {
    id: "3",
    title: "Personal Counseling",
    concern: "PERSONAL",
    description: "Need someone to talk to about personal issues",
    date: new Date(2026, 1, 19, 14, 0).toISOString(),
    status: "ACCEPTED",
    user: {
      name: "Bruce Wayne",
      email: "bruceWayne@dc.com",
    },
  },
  {
    id: "4",
    title: "Health Concerns",
    concern: "HEALTH",
    date: new Date(2026, 1, 18, 11, 0).toISOString(),
    status: "REJECTED",
    user: {
      name: "Peter Parker",
      email: "peterParker@gmail.com",
    },
  },
];

export default function AdminAppointments() {

  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "ACCEPTED" | "REJECTED">("ALL");

  const handleStatusChange = (
    id: string,
    newStatus: "ACCEPTED" | "REJECTED",
  ) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id ? { ...appt, status: newStatus } : appt,
      ),
    );
  };

  const filteredAppointments =
    filter === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === "ALL" ? "default" : "outline"}
            onClick={() => setFilter("ALL")}
            className="gap-2"
          >
            All
          </Button>
          <Button
            variant={filter === "PENDING" ? "default" : "outline"}
            onClick={() => setFilter("PENDING")}
            className="gap-2"
          >
            Pending
          </Button>
          <Button
            variant={filter === "ACCEPTED" ? "default" : "outline"}
            onClick={() => setFilter("ACCEPTED")}
            className="gap-2"
          >
            Accepted
          </Button>
          <Button
            variant={filter === "REJECTED" ? "default" : "outline"}
            onClick={() => setFilter("REJECTED")}
            className="gap-2"
          >
            Rejected
          </Button>
        </div>

        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground">No appointments found</p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => {
              const status = statusConfig[appointment.status];
              return (
                <Card
                  key={appointment.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-base">
                            {appointment.title}
                          </h3>
                          <Badge variant="outline" className={status.className}>
                            {status.label}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium">
                            {appointment.user.name}
                          </span>
                          <span className="text-muted-foreground">
                            • {appointment.user.email}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {concernConfig[appointment.concern] ??
                              appointment.concern}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {format(
                                new Date(appointment.date),
                                "MMMM d, yyyy",
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {format(new Date(appointment.date), "h:mm a")}
                            </span>
                          </div>
                        </div>

                        {appointment.description && (
                          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <p className="line-clamp-2">
                              {appointment.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {appointment.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50"
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
                            className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
                            onClick={() =>
                              handleStatusChange(appointment.id, "REJECTED")
                            }
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
