"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
} from "lucide-react";
import { format } from "date-fns";
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

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // View user profile
  const handleViewUser = async (userId: string) => {
    try {
      setProfileLoading(true);
      setIsDialogOpen(true);
      const response = await api.get(`/admin/users/${userId}`);
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
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage registered students
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-semibold">{stats.total}</span> users
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  With Appointments
                </p>
                <p className="text-2xl font-bold">{stats.withAppointments}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No Appointments</p>
                <p className="text-2xl font-bold">{stats.noAppointments}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No Profile</p>
                <p className="text-2xl font-bold">{stats.noProfile}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 flex-shrink-0">
                      <User className="h-6 w-6 text-primary" />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{user.name}</h3>
                        {!user.hasProfile && (
                          <Badge
                            variant="outline"
                            className="bg-orange-100 text-orange-700 border-orange-200"
                          >
                            No Profile
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span>{user.email}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>
                            {user.totalAppointments === 0 ? (
                              <span className="flex items-center gap-1">
                                <XCircle className="h-3.5 w-3.5 text-red-500" />
                                No appointments
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                {user.totalAppointments} appointment
                                {user.totalAppointments > 1 ? "s" : ""}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => handleViewUser(user.id)}
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Profile Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>

          {profileLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              {/* Profile Info */}
              {selectedUser.profile ? (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Full Name
                          </p>
                          <p className="font-medium">
                            {selectedUser.profile.firstName}{" "}
                            {selectedUser.profile.middleName &&
                              `${selectedUser.profile.middleName} `}
                            {selectedUser.profile.lastName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{selectedUser.email}</p>
                        </div>
                      </div>

                      {selectedUser.profile.phoneNumber && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Phone
                            </p>
                            <p className="font-medium">
                              {selectedUser.profile.phoneNumber}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Cake className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Age</p>
                          <p className="font-medium">
                            {calculateAge(selectedUser.profile.birthDate)} years
                            old
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <UsersIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Gender
                          </p>
                          <p className="font-medium capitalize">
                            {selectedUser.profile.gender.toLowerCase()}
                          </p>
                        </div>
                      </div>

                      {selectedUser.profile.address && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Address
                            </p>
                            <p className="font-medium">
                              {selectedUser.profile.address}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">
                      No profile information available
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Appointments */}
              <div>
                <h3 className="font-semibold mb-3">
                  Appointments ({selectedUser._count.appointments})
                </h3>
                {selectedUser.appointments.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">No appointments</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {selectedUser.appointments.map((appt) => (
                      <Card key={appt.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{appt.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(
                                  new Date(appt.date),
                                  "MMMM d, yyyy · h:mm a",
                                )}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                appt.status === "ACCEPTED"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : appt.status === "PENDING"
                                    ? "bg-orange-100 text-orange-700 border-orange-200"
                                    : "bg-red-100 text-red-700 border-red-200"
                              }
                            >
                              {appt.status}
                            </Badge>
                          </div>
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
