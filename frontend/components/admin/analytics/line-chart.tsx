"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  total: {
    label: "Appointments",
    color: "#8884d8", // Changed to direct color
  },
} satisfies ChartConfig;

interface ChartLineDotsProps {
  data: Array<{
    month: string;
    total: number;
    accepted: number;
    pending: number;
  }>;
}

export function ChartLineDots({ data }: ChartLineDotsProps) {
  // Find the peak month
  const peakMonth = data.reduce(
    (max, current) => (current.total > max.total ? current : max),
    data[0],
  );

  const totalAppointments = data.reduce((sum, item) => sum + item.total, 0);
  const averagePerMonth = (totalAppointments / data.length).toFixed(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Appointments Trend</CardTitle>
        <CardDescription>
          Total appointments per month - Last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={{
                stroke: "#8884d8",
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="total"
              type="monotone"
              stroke="#8884d8"
              strokeWidth={3}
              dot={{
                fill: "#8884d8",
                r: 5,
              }}
              activeDot={{
                r: 7,
                fill: "#8884d8",
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Peak: {peakMonth.month} with {peakMonth.total} appointments
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Average {averagePerMonth} appointments per month
        </div>
      </CardFooter>
    </Card>
  );
}
