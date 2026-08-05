"use client";

import { useTransition } from "react";
import { toggleUserActiveAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

type UserStatusToggleProps = {
  userId: string;
  isActive: boolean;
  disabled?: boolean;
};

export function UserStatusToggle({
  userId,
  isActive,
  disabled = false,
}: UserStatusToggleProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant={isActive ? "outline" : "default"}
      size="sm"
      disabled={disabled || isPending}
      className="rounded-lg"
      onClick={() => {
        startTransition(async () => {
          await toggleUserActiveAction(userId, isActive);
        });
      }}
    >
      {isPending ? "Saving..." : isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
