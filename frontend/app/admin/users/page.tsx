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
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Phone,
  MapPin,
  Cake,
  Users as UsersIcon,
  Inbox,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface UserData {
  id: string;
  email: string;
  hasProfile: boolean;
  createdAt: string;
  totalAppointments: number;
  name: string;
}

interface UserProfile {
  id: string;
  email: string;
  createdAt: string;
  profile?: {
    firstName: string;
    lastName: string;
    middleName?: string;
    birthDate: string;
    gender: string;
    address?: string;
    phoneNumber?: string;
  };
  _count: {
    appointments: number;
  };
  appointments: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
  }>;
}

const appointmentStatusClassName: Record<string, string> = {
  ACCEPTED: "bg-primary/10 text-primary border-primary/20",
  PENDING: "bg-muted text-muted-foreground border-border",
  REJECTED: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get<UserData[]>("/admin/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleViewUser = async (userId: string) => {
    try {
      setProfileLoading(true);
      setIsDialogOpen(true);
      const response = await api.get<UserProfile>(`/admin/users/${userId}`);
      setSelectedUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  }

  const stats = {
    total: users.length,
    withAppointments: users.filter((u) => u.totalAppointments > 0).length,
    noAppointments: users.filter((u) => u.totalAppointments === 0).length,
    noProfile: users.filter((u) => !u.hasProfile).length,
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Users
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage registered Users
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{stats.total}</span> users
          </div>
        </div>

        {/* Stats — 2 cols mobile, 4 from sm */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 sm:pt-6">
              <p className="text-xs text-muted-foreground sm:text-sm">
                Total Users
              </p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 sm:pt-6">
              <p className="text-xs text-muted-foreground sm:text-sm">
                With Appointments
              </p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">
                {stats.withAppointments}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 sm:pt-6">
              <p className="text-xs text-muted-foreground sm:text-sm">
                No Appointments
              </p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">
                {stats.noAppointments}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 sm:pt-6">
              <p className="text-xs text-muted-foreground sm:text-sm">
                No Profile
              </p>
              <p className="mt-1 text-xl font-bold sm:text-2xl">
                {stats.noProfile}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User list */}
        <div className="space-y-3">
          {users.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="flex flex-col items-center justify-center gap-2 py-16">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                  <Inbox className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">No users found</p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card
                key={user.id}
                className="shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent sm:h-12 sm:w-12">
                      <User className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="truncate font-semibold">{user.name}</h3>
                        {!user.hasProfile && (
                          <Badge
                            variant="outline"
                            className="shrink-0 bg-muted text-muted-foreground border-border"
                          >
                            No Profile
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        {user.totalAppointments === 0 ? (
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3.5 w-3.5 text-destructive/70" />
                            No appointments
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5 text-primary" />
                            {user.totalAppointments} appointment
                            {user.totalAppointments > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1.5"
                      onClick={() => handleViewUser(user.id)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* User profile dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-xl sm:w-full">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>

          {profileLoading ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              {selectedUser.profile ? (
                <Card className="shadow-sm">
                  <CardContent className="divide-y divide-border p-0">
                    <ProfileRow
                      icon={User}
                      label="Full Name"
                      value={`${selectedUser.profile.firstName} ${selectedUser.profile.middleName
                          ? `${selectedUser.profile.middleName} `
                          : ""
                        }${selectedUser.profile.lastName}`}
                    />
                    <ProfileRow
                      icon={Mail}
                      label="Email"
                      value={selectedUser.email}
                    />
                    {selectedUser.profile.phoneNumber && (
                      <ProfileRow
                        icon={Phone}
                        label="Phone"
                        value={selectedUser.profile.phoneNumber}
                      />
                    )}
                    <ProfileRow
                      icon={Cake}
                      label="Age"
                      value={`${calculateAge(
                        selectedUser.profile.birthDate,
                      )} years old`}
                    />
                    <ProfileRow
                      icon={UsersIcon}
                      label="Gender"
                      value={selectedUser.profile.gender.toLowerCase()}
                      capitalize
                    />
                    {selectedUser.profile.address && (
                      <ProfileRow
                        icon={MapPin}
                        label="Address"
                        value={selectedUser.profile.address}
                      />
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-sm">
                  <CardContent className="py-10 text-center">
                    <p className="text-sm text-muted-foreground">
                      No profile information available
                    </p>
                  </CardContent>
                </Card>
              )}

              <div>
                <h3 className="mb-3 font-semibold">
                  Appointments ({selectedUser._count.appointments})
                </h3>
                {selectedUser.appointments.length === 0 ? (
                  <Card className="shadow-sm">
                    <CardContent className="py-10 text-center">
                      <p className="text-sm text-muted-foreground">
                        No appointments
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.appointments.map((appt) => (
                      <Card key={appt.id} className="shadow-sm">
                        <CardContent className="flex items-center justify-between gap-3 p-4">
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {appt.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(
                                new Date(appt.date),
                                "MMM d, yyyy · h:mm a",
                              )}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0",
                              appointmentStatusClassName[appt.status] ??
                              "bg-muted text-muted-foreground border-border",
                            )}
                          >
                            {appt.status}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
  capitalize,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("truncate text-sm font-medium", capitalize && "capitalize")}>
          {value}
        </p>
      </div>
    </div>
  );
}