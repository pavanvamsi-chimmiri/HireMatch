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
  REVIEWING: "hsl(210 80% 55%)",
  SHORTLISTED: "hsl(190 70% 45%)",
  INTERVIEW: "hsl(230 70% 55%)",
  OFFERED: "hsl(150 60% 45%)",
  REJECTED: "hsl(0 70% 55%)",
  WITHDRAWN: "hsl(30 20% 50%)",
};

type ApplicantPipelineChartProps = {
  statusCounts: Record<string, number>;
};

export function ApplicantPipelineChart({
  statusCounts,
}: ApplicantPipelineChartProps) {
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
          <CardTitle>Applicant Pipeline</CardTitle>
          <CardDescription>Breakdown by hiring stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[250px] items-center justify-center rounded-lg border border-dashed">
            No applicants yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Applicant Pipeline</CardTitle>
        <CardDescription>Breakdown by hiring stage</CardDescription>
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

type HiringActivityChartProps = {
  data: { month: string; count: number }[];
};

const timelineConfig = {
  count: {
    label: "Applications",
    color: "hsl(210 80% 55%)",
  },
} satisfies ChartConfig;

export function HiringActivityChart({ data }: HiringActivityChartProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Hiring Activity</CardTitle>
        <CardDescription>
          Applications received over the last 6 months
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

type HiringFunnelChartProps = {
  funnel: {
    applied: number;
    reviewing: number;
    shortlisted: number;
    interview: number;
    offered: number;
  };
};

const funnelConfig = {
  count: {
    label: "Candidates",
    color: "hsl(190 70% 45%)",
  },
} satisfies ChartConfig;

export function HiringFunnelChart({ funnel }: HiringFunnelChartProps) {
  const data = [
    { stage: "Applied", count: funnel.applied },
    { stage: "Reviewing", count: funnel.reviewing },
    { stage: "Shortlisted", count: funnel.shortlisted },
    { stage: "Interview", count: funnel.interview },
    { stage: "Offered", count: funnel.offered },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Hiring Funnel</CardTitle>
        <CardDescription>Candidate progression across stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={funnelConfig} className="h-[280px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 0, left: 16 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="stage"
              tickLine={false}
              axisLine={false}
              width={90}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

type ApplicationsByJobChartProps = {
  data: { jobTitle: string; count: number }[];
};

const jobChartConfig = {
  count: {
    label: "Applicants",
    color: "hsl(230 70% 55%)",
  },
} satisfies ChartConfig;

export function ApplicationsByJobChart({ data }: ApplicationsByJobChartProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Applications by Job</CardTitle>
          <CardDescription>Volume per open role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[280px] items-center justify-center rounded-lg border border-dashed">
            No job data yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Applications by Job</CardTitle>
        <CardDescription>Volume per role</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={jobChartConfig} className="h-[280px] w-full">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="jobTitle"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={70}
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
