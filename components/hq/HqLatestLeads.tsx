import { CheckCircle2, Circle, MinusCircle } from "lucide-react";
import type { LeadAssessmentRow } from "@/lib/hq/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Jamaica",
  }).format(new Date(value));
}

function formatWhatsApp(value: string) {
  const digits = value.replace(/\D/g, "");
  const localDigits =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (localDigits.length !== 10) {
    return value;
  }

  return `+1 (${localDigits.slice(0, 3)}) ${localDigits.slice(
    3,
    6,
  )}-${localDigits.slice(6)}`;
}

function formatList(values: string[] | null) {
  return values?.filter(Boolean).join(", ") || "None listed";
}

function formatSource(lead: LeadAssessmentRow) {
  return lead.utm_source?.trim() || lead.source?.trim() || "direct";
}

function formatStatus(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function LatestIndicator({ isLatest }: { isLatest: boolean }) {
  if (isLatest) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-growth/40 bg-growth/10 px-2.5 py-1 text-xs font-semibold text-foreground">
        <CheckCircle2 aria-hidden="true" className="size-3.5 text-accent" />
        Yes
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-secondary">
      <MinusCircle aria-hidden="true" className="size-3.5" />
      No
    </span>
  );
}

function CommunityStatus({ status }: { status: string }) {
  const isJoined = status === "joined";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        isJoined
          ? "border-growth/40 bg-growth/10 text-foreground"
          : "border-border bg-background text-secondary"
      }`}
    >
      <Circle
        aria-hidden="true"
        className={`size-2.5 ${isJoined ? "fill-growth text-growth" : "fill-accent text-accent"}`}
      />
      {formatStatus(status)}
    </span>
  );
}

function LeadMobileCard({ lead }: { lead: LeadAssessmentRow }) {
  const details = [
    ["WhatsApp", formatWhatsApp(lead.customer_whatsapp)],
    ["Source", formatSource(lead)],
    ["Goal", lead.goal],
    ["Appliances", formatList(lead.appliances)],
    ["Runtime", lead.runtime],
    ["Budget", lead.budget],
    ["Journey stage", lead.journey_stage],
    ["Recommendation", lead.recommendation_title],
  ];

  return (
    <article className="grid gap-4 rounded-card border border-border bg-surface/90 p-4">
      <div className="grid gap-1">
        <p className="text-sm font-semibold text-accent">
          {formatDate(lead.assessment_created_at)}
        </p>
        <h3 className="text-lg font-semibold leading-tight text-foreground">
          {lead.customer_name}
        </h3>
      </div>

      <dl className="grid gap-3">
        {details.map(([label, value]) => (
          <div className="grid gap-1" key={label}>
            <dt className="text-xs font-semibold uppercase text-secondary">
              {label}
            </dt>
            <dd className="text-sm leading-6 text-muted">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2">
        <CommunityStatus status={lead.community_status} />
        <LatestIndicator isLatest={lead.is_latest} />
      </div>
    </article>
  );
}

export function HqLatestLeads({ leads }: { leads: LeadAssessmentRow[] }) {
  if (leads.length === 0) {
    return (
      <section
        aria-labelledby="latest-leads-heading"
        className="rounded-card border border-border bg-surface/90 p-6 shadow-card"
      >
        <div className="grid gap-2">
          <h2
            className="text-xl font-semibold text-foreground"
            id="latest-leads-heading"
          >
            Latest leads
          </h2>
          <p className="text-sm leading-6 text-muted">
            No leads yet. Share a campaign link to start collecting assessments.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="latest-leads-heading"
      className="grid gap-4 rounded-card border border-border bg-surface/90 p-4 shadow-card sm:p-5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-1">
          <h2
            className="text-xl font-semibold text-foreground"
            id="latest-leads-heading"
          >
            Latest leads
          </h2>
          <p className="text-sm leading-6 text-muted">
            Showing the latest 25 assessments.
          </p>
        </div>
        <p className="text-xs font-semibold uppercase text-secondary">
          Read-only
        </p>
      </div>

      <div className="grid gap-3 md:hidden">
        {leads.map((lead) => (
          <LeadMobileCard key={lead.assessment_id} lead={lead} />
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[78rem] border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold uppercase text-secondary">
              {[
                "Date",
                "Customer name",
                "WhatsApp",
                "Source",
                "Goal",
                "Appliances",
                "Runtime",
                "Budget",
                "Journey stage",
                "Recommendation",
                "Community status",
                "Latest?",
              ].map((heading) => (
                <th
                  className="border-b border-border px-3 py-3 first:pl-0 last:pr-0"
                  key={heading}
                  scope="col"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                className="align-top text-muted transition hover:bg-background/50"
                key={lead.assessment_id}
              >
                <td className="border-b border-border/70 px-3 py-4 pl-0 text-foreground">
                  {formatDate(lead.assessment_created_at)}
                </td>
                <td className="border-b border-border/70 px-3 py-4 font-semibold text-foreground">
                  {lead.customer_name}
                </td>
                <td className="border-b border-border/70 px-3 py-4">
                  {formatWhatsApp(lead.customer_whatsapp)}
                </td>
                <td className="border-b border-border/70 px-3 py-4">
                  {formatSource(lead)}
                </td>
                <td className="border-b border-border/70 px-3 py-4">
                  {lead.goal}
                </td>
                <td className="max-w-56 border-b border-border/70 px-3 py-4">
                  {formatList(lead.appliances)}
                </td>
                <td className="border-b border-border/70 px-3 py-4">
                  {lead.runtime}
                </td>
                <td className="border-b border-border/70 px-3 py-4">
                  {lead.budget}
                </td>
                <td className="border-b border-border/70 px-3 py-4">
                  {lead.journey_stage}
                </td>
                <td className="border-b border-border/70 px-3 py-4 font-semibold text-foreground">
                  {lead.recommendation_title}
                </td>
                <td className="border-b border-border/70 px-3 py-4">
                  <CommunityStatus status={lead.community_status} />
                </td>
                <td className="border-b border-border/70 px-3 py-4 pr-0">
                  <LatestIndicator isLatest={lead.is_latest} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
