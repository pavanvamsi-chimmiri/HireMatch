import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type CandidateSearchRedirectProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function CandidateSearchRedirect({
  searchParams,
}: CandidateSearchRedirectProps) {
  const { q } = await searchParams;
  const params = q ? `?q=${encodeURIComponent(q)}` : "";
  redirect(`/dashboard/hr/search${params}`);
}
