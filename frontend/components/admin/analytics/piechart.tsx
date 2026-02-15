"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
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
  count: {
    label: "Appointments",
  },
} satisfies ChartConfig;

const concernColors: Record<string, string> = {
  ACADEMIC: "#4F46E5",
  PERSONAL: "#F97316",
  HEALTH: "#10B981",
  CAREER: "#F59E0B",
  OTHER: "#6B7280",
};

interface ChartPieLabelProps {
  data: Array<{
    concern: string;
    count: number;
  }>;
}

export function ChartPieLabel({ data }: ChartPieLabelProps) {
  const chartData = data.map((item) => ({
    concern: item.concern,
    count: item.count,
    fill: concernColors[item.concern] || "#6B7280",
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Appointments by Concern</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="count"
              label
              nameKey="concern"
              labelLine={false}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Distribution by concern type <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total appointments categorized by concern
        </div>
      </CardFooter>
    </Card>
  );
}
