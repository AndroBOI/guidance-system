"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface AnalyticsData {
  totalUsers: number;
  totalAppointments: number;
  pendingAppointments: number;
  acceptedAppointments: number;
  rejectedAppointments: number;
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

// ---- Hardcoded for now — swap for /admin/analytics response later ----
const mockData: AnalyticsData = {
  totalUsers: 156,
  totalAppointments: 342,
  pendingAppointments: 23,
  acceptedAppointments: 289,
  rejectedAppointments: 30,
  appointmentsByMonth: [
    { month: "Jan", total: 45, accepted: 40, pending: 5 },
    { month: "Feb", total: 52, accepted: 48, pending: 4 },
    { month: "Mar", total: 61, accepted: 55, pending: 6 },
    { month: "Apr", total: 48, accepted: 43, pending: 5 },
    { month: "May", total: 68, accepted: 62, pending: 6 },
    { month: "Jun", total: 58, accepted: 53, pending: 5 },
  ],
  appointmentsByConcern: [
    { concern: "Academic", count: 125 },
    { concern: "Personal", count: 89 },
    { concern: "Health", count: 67 },
    { concern: "Career", count: 45 },
    { concern: "Other", count: 16 },
  ],
  userGrowth: [
    { month: "Jan", newUsers: 18 },
    { month: "Feb", newUsers: 24 },
    { month: "Mar", newUsers: 31 },
    { month: "Apr", newUsers: 22 },
    { month: "May", newUsers: 28 },
    { month: "Jun", newUsers: 33 },
  ],
};

// Chart colors pulled from your globals.css --chart-1..5 tokens
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const chartTooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  fontSize: "12px",
  color: "var(--popover-foreground)",
};

export default function AnalyticsPage() {
  const data = mockData;

  const acceptanceRate = Math.round(
    (data.acceptedAppointments / data.totalAppointments) * 100,
  );
  const statusBreakdown = [
    { status: "Accepted", count: data.acceptedAppointments },
    { status: "Pending", count: data.pendingAppointments },
    { status: "Rejected", count: data.rejectedAppointments },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Analytics
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Overview of platform activity and appointment trends
          </p>
        </div>

        {/* Stats — pending gets visual emphasis since it's the actionable one */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card className="shadow-sm border-primary/30 bg-primary/5 lg:col-span-1">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  Pending Requests
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-primary sm:text-3xl">
                {data.pendingAppointments}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  Acceptance Rate
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold sm:text-3xl">
                {acceptanceRate}%
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Of all requests
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  Total Users
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold sm:text-3xl">
                {data.totalUsers}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Registered Users
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                  Total Appointments
                </p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold sm:text-3xl">
                {data.totalAppointments}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                All time sessions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trend row — appointments + user growth */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-primary" />
                Appointments Over Time
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Total requests vs. accepted, by month
              </p>
            </CardHeader>
            <CardContent className="pl-0">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={data.appointmentsByMonth}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--chart-1)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accepted"
                    name="Accepted"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--chart-2)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus className="h-4 w-4 text-primary" />
                User Growth
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                New sign-ups per month
              </p>
            </CardHeader>
            <CardContent className="pl-0">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart
                  data={data.userGrowth}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="userGrowthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--chart-1)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--chart-1)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    name="New Users"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#userGrowthFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown row — concern + status */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Appointments by Concern
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                What Users are reaching out about
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.appointmentsByConcern}
                    dataKey="count"
                    nameKey="concern"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {data.appointmentsByConcern.map((_, index) => (
                      <Cell
                        key={index}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke="var(--background)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Status Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">
                Where all appointments currently stand
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={statusBreakdown}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="status"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
                    {statusBreakdown.map((entry, index) => (
                      <Cell
                        key={entry.status}
                        fill={
                          entry.status === "Accepted"
                            ? "var(--chart-2)"
                            : entry.status === "Pending"
                              ? "var(--chart-3)"
                              : "var(--chart-5)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}