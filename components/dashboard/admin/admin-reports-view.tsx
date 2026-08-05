import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminReportsData } from "@/types/admin";

type AdminReportsViewProps = {
  data: AdminReportsData;
};

export function AdminReportsView({ data }: AdminReportsViewProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-gradient-to-r from-amber-500/5 to-orange-600/5">
        <CardHeader>
          <CardTitle>Report Snapshot</CardTitle>
          <CardDescription>
            Generated {new Date(data.generatedAt).toLocaleString()}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {data.sections.map((section) => (
          <Card key={section.id} className="border-border/50">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {section.metrics.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No data available.
                </p>
              ) : (
                <dl className="space-y-3">
                  {section.metrics.map((metric) => (
                    <div
                      key={`${section.id}-${metric.label}`}
                      className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
                    >
                      <dt className="text-muted-foreground text-sm">
                        {metric.label}
                      </dt>
                      <dd className="font-semibold tabular-nums">
                        {metric.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
