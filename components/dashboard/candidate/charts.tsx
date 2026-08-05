"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  REVIEWING: "Reviewing",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  OFFERED: "Offered",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "hsl(220 14% 60%)",
  REVIEWING: "hsl(250 60% 60%)",
  SHORTLISTED: "hsl(270 70% 55%)",
  INTERVIEW: "hsl(200 80% 50%)",
  OFFERED: "hsl(150 60% 45%)",
  REJECTED: "hsl(0 70% 55%)",
  WITHDRAWN: "hsl(30 20% 50%)",
};

type ApplicationStatusChartProps = {
  statusCounts: Record<string, number>;
};

export function ApplicationStatusChart({
  statusCounts,
}: ApplicationStatusChartProps) {
  const data = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    label: STATUS_LABELS[status] ?? status,
    count,
    fill: STATUS_COLORS[status] ?? "hsl(var(--muted-foreground))",
  }));

  const chartConfig = data.reduce((acc, item) => {
    acc[item.status] = { label: item.label, color: item.fill };
    return acc;
  }, {} as ChartConfig);

  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>Breakdown by current status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[250px] items-center justify-center rounded-lg border border-dashed">
            No applications yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Application Status</CardTitle>
        <CardDescription>Breakdown by current status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto h-[250px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.status} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

type ApplicationsTimelineChartProps = {
  data: { month: string; count: number }[];
};

const timelineConfig = {
  count: {
    label: "Applications",
    color: "hsl(270 70% 55%)",
  },
} satisfies ChartConfig;

export function ApplicationsTimelineChart({
  data,
}: ApplicationsTimelineChartProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Application Activity</CardTitle>
        <CardDescription>
          Applications submitted over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={timelineConfig} className="h-[250px] w-full">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
