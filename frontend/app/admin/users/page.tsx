"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, CheckCircle, XCircle, Eye } from "lucide-react";
import { format } from "date-fns";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  hasProfile: boolean;
  createdAt: string;
  totalAppointments: number;
  lastAppointment?: string;
}

const MOCK_USERS: UserData[] = [
  {
    id: "1",
    name: "Test 1",
    email: "test1@example.com",
    role: "USER",
    hasProfile: true,
    createdAt: new Date(2026, 0, 15).toISOString(),
    totalAppointments: 3,
    lastAppointment: new Date(2026, 1, 18).toISOString(),
  },
  {
    id: "2",
    name: "Test 2",
    email: "test2@example.com",
    role: "USER",
    hasProfile: true,
    createdAt: new Date(2026, 0, 20).toISOString(),
    totalAppointments: 1,
    lastAppointment: new Date(2026, 1, 15).toISOString(),
  },
  {
    id: "3",
    name: "Test 3",
    email: "test3@example.com",
    role: "USER",
    hasProfile: true,
    createdAt: new Date(2025, 11, 10).toISOString(),
    totalAppointments: 0,
  },
  {
    id: "4",
    name: "Test 4",
    email: "test4@example.com",
    role: "USER",
    hasProfile: false,
    createdAt: new Date(2026, 1, 1).toISOString(),
    totalAppointments: 0,
  },
  {
    id: "5",
    name: "Carlos Mendoza",
    email: "test5@example.com",
    role: "USER",
    hasProfile: true,
    createdAt: new Date(2026, 0, 5).toISOString(),
    totalAppointments: 5,
    lastAppointment: new Date(2026, 1, 20).toISOString(),
  },
];

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="w-full space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: <span className="font-semibold">{MOCK_USERS.length}</span>{" "}
            users
          </div>
        </div>

       
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{MOCK_USERS.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  With Appointments
                </p>
                <p className="text-2xl font-bold">
                  {MOCK_USERS.filter((u) => u.totalAppointments > 0).length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No Appointments</p>
                <p className="text-2xl font-bold">
                  {MOCK_USERS.filter((u) => u.totalAppointments === 0).length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No Profile</p>
                <p className="text-2xl font-bold">
                  {MOCK_USERS.filter((u) => !u.hasProfile).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

    
        <div className="space-y-3">
          {MOCK_USERS.map((user) => (
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

                        {user.lastAppointment && (
                          <span className="text-xs">
                            Last:{" "}
                            {format(
                              new Date(user.lastAppointment),
                              "MMM d, yyyy",
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

    
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
