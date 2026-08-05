"use client";

import { useTransition } from "react";
import type { Prisma } from "@prisma/client";
import { updateSystemSettingAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminSystemSetting } from "@/types/admin";

type AdminSettingsFormProps = {
  settings: AdminSystemSetting[];
};

function getNumericValue(value: unknown, key: string): string {
  if (value && typeof value === "object" && key in value) {
    const entry = (value as Record<string, unknown>)[key];
    return entry !== undefined ? String(entry) : "";
  }
  return "";
}

export function AdminSettingsForm({ settings }: AdminSettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  if (settings.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="text-muted-foreground py-16 text-center text-sm">
          No system settings configured yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {settings.map((setting) => {
        const value =
          setting.value && typeof setting.value === "object"
            ? (setting.value as Record<string, unknown>)
            : {};

        return (
          <Card key={setting.id} className="border-border/50">
            <CardHeader>
              <CardTitle className="capitalize">
                {setting.category} / {setting.key.replace(/_/g, " ")}
              </CardTitle>
              <CardDescription>
                Last updated {new Date(setting.updatedAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  const nextValue: Record<string, unknown> = { ...value };

                  formData.forEach((fieldValue, fieldKey) => {
                    const raw = fieldValue.toString();
                    const numeric = Number(raw);
                    nextValue[fieldKey] = Number.isNaN(numeric) ? raw : numeric;
                  });

                  startTransition(async () => {
                    await updateSystemSettingAction(
                      setting.id,
                      nextValue as Prisma.InputJsonValue,
                    );
                  });
                }}
              >
                {Object.entries(value).map(([key, fieldValue]) => (
                  <div key={key} className="space-y-2">
                    <label
                      htmlFor={`${setting.id}-${key}`}
                      className="text-sm font-medium capitalize"
                    >
                      {key.replace(/([A-Z])/g, " $1")}
                    </label>
                    <Input
                      id={`${setting.id}-${key}`}
                      name={key}
                      defaultValue={
                        getNumericValue(value, key) || String(fieldValue ?? "")
                      }
                      className="rounded-xl"
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                  >
                    {isPending ? "Saving..." : "Save Setting"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
