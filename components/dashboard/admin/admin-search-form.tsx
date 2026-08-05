"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type AdminSearchFormProps = {
  placeholder?: string;
  defaultValue?: string;
};

export function AdminSearchForm({
  placeholder = "Search...",
  defaultValue = "",
}: AdminSearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <form
      className="flex w-full max-w-md gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const query = formData.get("q")?.toString().trim() ?? "";
        const params = new URLSearchParams(searchParams.toString());

        if (query) {
          params.set("q", query);
        } else {
          params.delete("q");
        }

        router.push(`?${params.toString()}`);
      }}
    >
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="rounded-xl pl-9"
        />
      </div>
      <Button type="submit" className="rounded-xl">
        Search
      </Button>
    </form>
  );
}
