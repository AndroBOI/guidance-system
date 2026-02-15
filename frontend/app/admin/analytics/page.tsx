"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ChartLineDots } from "@/components/admin/analytics/line-chart";
import { ChartPieLabel } from "@/components/admin/analytics/piechart";
import { Users, Calendar } from "lucide-react";
import api from "@/lib/api";

interface AnalyticsData {
  totalUsers: number;
  totalAppointments: number;
  pendingAppointments: number;
  acceptedAppointments: number;
  appointmentsByMonth: Array<{
    month: string;
    total: number;
    accepted: number;
    pending: number;
  }>;
  appointmentsByConcern: Array<{
    concern: string;
    count: number;
  }>;
  userGrowth: Array<{
    month: string;
    newUsers: number;
  }>;
}

const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/admin/analytics");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  }

  const mockData: AnalyticsData = {
    totalUsers: 156,
    totalAppointments: 342,
    pendingAppointments: 23,
    acceptedAppointments: 289,
    appointmentsByMonth: [
      { month: "January", total: 45, accepted: 40, pending: 5 },
      { month: "February", total: 52, accepted: 48, pending: 4 },
      { month: "March", total: 61, accepted: 55, pending: 6 },
      { month: "April", total: 48, accepted: 43, pending: 5 },
      { month: "May", total: 68, accepted: 62, pending: 6 },
      { month: "June", total: 58, accepted: 53, pending: 5 },
    ],
    appointmentsByConcern: [
      { concern: "ACADEMIC", count: 125 },
      { concern: "PERSONAL", count: 89 },
      { concern: "HEALTH", count: 67 },
      { concern: "CAREER", count: 45 },
      { concern: "OTHER", count: 16 },
    ],
    userGrowth: [
      { month: "January", newUsers: 18 },
      { month: "February", newUsers: 24 },
      { month: "March", newUsers: 31 },
      { month: "April", newUsers: 22 },
      { month: "May", newUsers: 28 },
      { month: "June", newUsers: 33 },
    ],
  };

  const displayData = data || mockData;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="w-full space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              System overview and key metrics
            </p>
          </div>
        </div>


        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayData.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayData.totalAppointments}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All time sessions
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <ChartLineDots data={displayData.appointmentsByMonth} />
          <ChartPieLabel data={displayData.appointmentsByConcern} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
