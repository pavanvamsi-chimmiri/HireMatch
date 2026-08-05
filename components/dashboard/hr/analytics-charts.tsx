"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserX,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import type {
  HRAnalyticsData,
  HRAnalyticsFunnel,
  HRAnalyticsMonthlyHiring,
} from "@/types/hr-analytics";

const chartHeightClass = "min-h-[260px] w-full min-w-0 sm:min-h-[300px]";

type AnalyticsSummaryCardsProps = {
  summary: HRAnalyticsData["summary"];
};

export function AnalyticsSummaryCards({ summary }: AnalyticsSummaryCardsProps) {
  const cards = [
    {
      label: "Applications",
      value: summary.applications,
      icon: ClipboardList,
      gradient: "from-blue-600 to-cyan-600",
      description: "Total received",
    },
    {
      label: "Shortlisted",
      value: summary.shortlisted,
      icon: UserCheck,
      gradient: "from-emerald-500 to-teal-600",
      description: "Moved forward",
    },
    {
      label: "Rejected",
      value: summary.rejected,
      icon: UserX,
      gradient: "from-rose-500 to-red-600",
      description: "Not progressing",
    },
    {
      label: "Selected",
      value: summary.selected,
      icon: CheckCircle2,
      gradient: "from-indigo-600 to-violet-600",
      description: "Offers made",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="border-border/50 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <CardContent className="p-0">
            <div
              className={`bg-gradient-to-br ${card.gradient} flex items-start justify-between p-5 text-white`}
            >
              <div>
                <p className="text-sm text-white/80">{card.label}</p>
                <p className="mt-2 text-4xl font-bold tabular-nums">
                  {card.value}
                </p>
                <p className="mt-2 text-sm text-white/70">{card.description}</p>
              </div>
              <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                <card.icon className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const applicationsMetricsConfig = {
  count: {
    label: "Candidates",
    color: "hsl(210 80% 55%)",
  },
} satisfies ChartConfig;

type ApplicationsMetricsChartProps = {
  summary: HRAnalyticsData["summary"];
};

export function ApplicationsMetricsChart({
  summary,
}: ApplicationsMetricsChartProps) {
  const data = [
    {
      metric: "Applications",
      count: summary.applications,
      fill: "hsl(210 80% 55%)",
    },
    {
      metric: "Shortlisted",
      count: summary.shortlisted,
      fill: "hsl(160 60% 42%)",
    },
    { metric: "Rejected", count: summary.rejected, fill: "hsl(0 70% 55%)" },
    { metric: "Selected", count: summary.selected, fill: "hsl(250 70% 58%)" },
  ];

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5 text-blue-600 dark:text-cyan-400" />
          Applications Overview
        </CardTitle>
        <CardDescription>
          Compare total applications against shortlisted, rejected, and selected
          candidates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={applicationsMetricsConfig}
          className={chartHeightClass}
        >
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="metric"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
            />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.metric} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const monthlyHiringConfig = {
  applications: {
    label: "Applications",
    color: "hsl(210 80% 55%)",
  },
  shortlisted: {
    label: "Shortlisted",
    color: "hsl(160 60% 42%)",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(0 70% 55%)",
  },
  selected: {
    label: "Selected",
    color: "hsl(250 70% 58%)",
  },
} satisfies ChartConfig;

type MonthlyHiringChartProps = {
  data: HRAnalyticsMonthlyHiring[];
};

export function MonthlyHiringChart({ data }: MonthlyHiringChartProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-indigo-600 dark:text-indigo-300" />
          Monthly Hiring
        </CardTitle>
        <CardDescription>
          Application volume and outcomes over the last 6 months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={monthlyHiringConfig}
          className={chartHeightClass}
        >
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
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
            <Legend />
            <Bar
              dataKey="applications"
              fill="var(--color-applications)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="shortlisted"
              fill="var(--color-shortlisted)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="rejected"
              fill="var(--color-rejected)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="selected"
              fill="var(--color-selected)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const mostAppliedJobsConfig = {
  count: {
    label: "Applications",
    color: "hsl(230 70% 55%)",
  },
} satisfies ChartConfig;

type MostAppliedJobsChartProps = {
  data: HRAnalyticsData["mostAppliedJobs"];
};

export function MostAppliedJobsChart({ data }: MostAppliedJobsChartProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-5 text-blue-600 dark:text-cyan-400" />
            Most Applied Jobs
          </CardTitle>
          <CardDescription>Highest application volume by role.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex min-h-[260px] items-center justify-center rounded-xl border border-dashed">
            No job data yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="size-5 text-blue-600 dark:text-cyan-400" />
          Most Applied Jobs
        </CardTitle>
        <CardDescription>Highest application volume by role.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={mostAppliedJobsConfig}
          className={`${chartHeightClass} max-h-[420px]`}
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="jobTitle"
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const topSkillsConfig = {
  count: {
    label: "Mentions",
    color: "hsl(190 70% 45%)",
  },
} satisfies ChartConfig;

type TopSkillsChartProps = {
  data: HRAnalyticsData["topSkills"];
};

export function TopSkillsChart({ data }: TopSkillsChartProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Top Skills</CardTitle>
          <CardDescription>
            Most common skills across applicants and job requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex min-h-[260px] items-center justify-center rounded-xl border border-dashed">
            No skill data yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Top Skills</CardTitle>
        <CardDescription>
          Most common skills across applicants and job requirements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={topSkillsConfig}
          className={`${chartHeightClass} max-h-[420px]`}
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="skill"
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const funnelConfig = {
  count: {
    label: "Candidates",
    color: "hsl(190 70% 45%)",
  },
} satisfies ChartConfig;

type AnalyticsHiringFunnelChartProps = {
  funnel: HRAnalyticsFunnel;
};

export function AnalyticsHiringFunnelChart({
  funnel,
}: AnalyticsHiringFunnelChartProps) {
  const data = [
    { stage: "Applied", count: funnel.applied },
    { stage: "Reviewing", count: funnel.reviewing },
    { stage: "Shortlisted", count: funnel.shortlisted },
    { stage: "Interview", count: funnel.interview },
    { stage: "Selected", count: funnel.selected },
    { stage: "Rejected", count: funnel.rejected },
  ];

  const colors = [
    "hsl(210 80% 55%)",
    "hsl(230 70% 55%)",
    "hsl(160 60% 42%)",
    "hsl(190 70% 45%)",
    "hsl(250 70% 58%)",
    "hsl(0 70% 55%)",
  ];

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Hiring Funnel</CardTitle>
        <CardDescription>
          Candidate progression from application to selection or rejection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={funnelConfig} className={chartHeightClass}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 0, left: 12 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="stage"
              tickLine={false}
              axisLine={false}
              width={92}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={entry.stage} fill={colors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const pipelineConfig = {
  count: {
    label: "Applications",
    color: "hsl(210 80% 55%)",
  },
} satisfies ChartConfig;

type ApplicationPipelineChartProps = {
  summary: HRAnalyticsData["summary"];
};

export function ApplicationPipelineChart({
  summary,
}: ApplicationPipelineChartProps) {
  const data = [
    {
      name: "Applications",
      count: summary.applications,
      fill: "hsl(210 80% 55%)",
    },
    {
      name: "Shortlisted",
      count: summary.shortlisted,
      fill: "hsl(160 60% 42%)",
    },
    {
      name: "Rejected",
      count: summary.rejected,
      fill: "hsl(0 70% 55%)",
    },
    {
      name: "Selected",
      count: summary.selected,
      fill: "hsl(250 70% 58%)",
    },
  ].filter((item) => item.count > 0 || item.name === "Applications");

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Pipeline Distribution</CardTitle>
        <CardDescription>
          Share of applications by current outcome.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={pipelineConfig}
          className={`${chartHeightClass} mx-auto max-w-xl`}
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="42%"
              outerRadius="72%"
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const trendConfig = {
  applications: {
    label: "Applications",
    color: "hsl(210 80% 55%)",
  },
  selected: {
    label: "Selected",
    color: "hsl(250 70% 58%)",
  },
} satisfies ChartConfig;

type MonthlySelectionTrendChartProps = {
  data: HRAnalyticsMonthlyHiring[];
};

export function MonthlySelectionTrendChart({
  data,
}: MonthlySelectionTrendChartProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Selection Trend</CardTitle>
        <CardDescription>
          Applications vs selected candidates over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={trendConfig} className={chartHeightClass}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
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
            <Legend />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="var(--color-applications)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="selected"
              stroke="var(--color-selected)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

type TopRankedCandidatesPanelProps = {
  rankings: HRAnalyticsData["rankings"];
};

export function TopRankedCandidatesPanel({
  rankings,
}: TopRankedCandidatesPanelProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Top AI-Ranked Candidates</CardTitle>
        <CardDescription>
          Highest scoring candidates across your roles.{" "}
          <Link
            href="/dashboard/hr/rankings"
            className="font-medium text-blue-600 hover:underline dark:text-cyan-400"
          >
            View all rankings
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rankings.length === 0 ? (
          <p className="text-muted-foreground text-sm md:col-span-2 xl:col-span-3">
            No rankings available yet.
          </p>
        ) : (
          rankings.map((ranking) => (
            <div
              key={ranking.id}
              className="rounded-2xl border bg-gradient-to-br from-blue-600/5 to-cyan-600/5 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {ranking.candidate.name ?? ranking.candidate.email}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {ranking.job.title}
                  </p>
                </div>
                <Badge className="bg-blue-600/10 text-blue-700 dark:text-blue-300">
                  {Math.round(ranking.score)}%
                </Badge>
              </div>
              {ranking.aiSummary && (
                <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-6">
                  {ranking.aiSummary}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
