import { HqLatestLeads } from "@/components/hq/HqLatestLeads";
import { HqSummaryCards } from "@/components/hq/HqSummaryCards";
import { getHqOverview } from "@/lib/hq/getHqOverview";

export const dynamic = "force-dynamic";

function HqUnavailable() {
  return (
    <main className="min-h-dvh px-5 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-3xl content-center">
        <section className="rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
          <p className="text-sm font-semibold text-accent">Lumosyn HQ</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground">
            HQ data is unavailable.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted">
            The protected dashboard is reachable, but the server could not load
            lead data right now.
          </p>
        </section>
      </div>
    </main>
  );
}

export default async function HqPage() {
  const overview = await getHqOverview().catch(() => null);

  if (!overview) {
    return <HqUnavailable />;
  }

  return (
    <main className="min-h-dvh px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6">
        <header className="flex flex-col gap-4 rounded-card border border-border bg-surface/90 p-5 shadow-card sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              Lumosyn HQ
            </h1>
            <p className="text-base leading-7 text-muted">
              Internal lead and assessment overview
            </p>
          </div>
          <p className="inline-flex w-fit rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-xs font-semibold uppercase text-accent">
            Read-only V1
          </p>
        </header>

        <HqSummaryCards summary={overview.summary} />
        <HqLatestLeads leads={overview.latestLeads} />
      </div>
    </main>
  );
}
