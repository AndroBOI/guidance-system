"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

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

export const description = "A pie chart showing appointment concerns";

const chartData = [
  { concern: "ACADEMIC", count: 45, fill: "var(--color-academic)" },
  { concern: "PERSONAL", count: 30, fill: "var(--color-personal)" },
  { concern: "HEALTH", count: 15, fill: "var(--color-health)" },
  { concern: "CAREER", count: 8, fill: "var(--color-career)" },
  { concern: "OTHER", count: 2, fill: "var(--color-other)" },
];

const chartConfig = {
  count: {
    label: "Appointments",
  },
  ACADEMIC: {
    label: "Academic",
    color: "var(--chart-1)",
  },
  PERSONAL: {
    label: "Personal",
    color: "var(--chart-2)",
  },
  HEALTH: {
    label: "Health",
    color: "var(--chart-3)",
  },
  CAREER: {
    label: "Career",
    color: "var(--chart-4)",
  },
  OTHER: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function ChartPieLabel() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Concern Distribution</CardTitle>
        <CardDescription>Semester 1 – 2026</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="count" label nameKey="concern" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 12% this semester <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing appointment concerns distribution for this semester
        </div>
      </CardFooter>
    </Card>
  );
}
