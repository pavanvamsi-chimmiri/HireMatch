"use client";

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
  Building2,
  ClipboardList,
  TrendingUp,
  UserCheck,
  Users,
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
import type { AdminAnalyticsData } from "@/types/admin";

const chartHeightClass = "min-h-[260px] w-full min-w-0 sm:min-h-[300px]";

type AdminAnalyticsSummaryCardsProps = {
  summary: AdminAnalyticsData["summary"];
};

export function AdminAnalyticsSummaryCards({
  summary,
}: AdminAnalyticsSummaryCardsProps) {
  const cards = [
    {
      label: "Users",
      value: summary.users,
      icon: Users,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      label: "Applications",
      value: summary.applications,
      icon: ClipboardList,
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      label: "Open Jobs",
      value: summary.openJobs,
      icon: Briefcase,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      label: "Companies",
      value: summary.companies,
      icon: Building2,
      gradient: "from-indigo-600 to-violet-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-border/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
            <div
              className={`rounded-lg bg-gradient-to-br ${card.gradient} p-2 text-white`}
            >
              <card.icon className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const trendChartConfig = {
  users: { label: "Users", color: "hsl(var(--chart-1))" },
  applications: { label: "Applications", color: "hsl(var(--chart-2))" },
  jobs: { label: "Jobs", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

export function AdminMonthlyTrendsChart({
  data,
}: {
  data: AdminAnalyticsData["monthlyTrends"];
}) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-4" />
          Platform Growth
        </CardTitle>
        <CardDescription>
          Users, applications, and jobs over the last six months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={trendChartConfig} className={chartHeightClass}>
          <LineChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="var(--color-users)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="applications"
              stroke="var(--color-applications)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="jobs"
              stroke="var(--color-jobs)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const roleColors = ["#f59e0b", "#2563eb", "#10b981", "#8b5cf6"];

export function AdminRoleDistributionChart({
  data,
}: {
  data: AdminAnalyticsData["roleDistribution"];
}) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>User Roles</CardTitle>
        <CardDescription>Distribution of platform accounts</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center text-sm">
            No user data available.
          </p>
        ) : (
          <ChartContainer
            config={{ count: { label: "Users", color: "hsl(var(--chart-1))" } }}
            className={chartHeightClass}
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={data}
                dataKey="count"
                nameKey="role"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.role}
                    fill={roleColors[index % roleColors.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

const statusChartConfig = {
  count: { label: "Applications", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function AdminApplicationStatusChart({
  data,
}: {
  data: AdminAnalyticsData["applicationStatuses"];
}) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="size-4" />
          Application Status
        </CardTitle>
        <CardDescription>Pipeline breakdown across all jobs</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center text-sm">
            No application data available.
          </p>
        ) : (
          <ChartContainer
            config={statusChartConfig}
            className={chartHeightClass}
          >
            <BarChart data={data} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="status" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={8} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminTopJobsChart({
  data,
}: {
  data: AdminAnalyticsData["topJobs"];
}) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Most Applied Jobs</CardTitle>
        <CardDescription>
          Roles with the highest application volume
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center text-sm">
            No job application data available.
          </p>
        ) : (
          <ChartContainer
            config={{
              count: { label: "Applications", color: "hsl(var(--chart-3))" },
            }}
            className={chartHeightClass}
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 8, right: 8 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="jobTitle"
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={8} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminHiringOutcomeCards({
  summary,
}: {
  summary: AdminAnalyticsData["summary"];
}) {
  const cards = [
    { label: "Shortlisted", value: summary.shortlisted },
    { label: "Rejected", value: summary.rejected },
    { label: "Selected", value: summary.selected },
    {
      label: "HR Users",
      value: summary.hrUsers,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>{card.label}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {card.value}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
