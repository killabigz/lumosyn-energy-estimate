import {
  CalendarClock,
  CheckCircle2,
  Circle,
  MinusCircle,
  PhoneCall,
  Save,
} from "lucide-react";
import type { ReactNode } from "react";
import { updateLeadFollowUp } from "@/app/hq/actions";
import { formatAppliancesWithQuantities } from "@/lib/hq/applianceDisplay";
import {
  getLeadPriorityLabel,
  getLeadStatusLabel,
  LEAD_PRIORITY_OPTIONS,
  LEAD_STATUS_OPTIONS,
  normalizeLeadPriority,
  normalizeLeadStatus,
  type LeadPriority,
} from "@/lib/hq/leadFollowUp";
import type { LeadAssessmentRow } from "@/lib/hq/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Jamaica",
  }).format(new Date(value));
}

function hasValidDate(value: string | null): value is string {
  return !!value && !Number.isNaN(new Date(value).getTime());
}

function formatOptionalDate(value: string | null) {
  return hasValidDate(value) ? formatDate(value) : "Not set";
}

function getDateTimeLocalPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  return parts.find((part) => part.type === type)?.value ?? "";
}

function formatDateTimeLocal(value: string | null) {
  if (!hasValidDate(value)) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: "America/Jamaica",
    year: "numeric",
  }).formatToParts(new Date(value));

  return `${getDateTimeLocalPart(parts, "year")}-${getDateTimeLocalPart(
    parts,
    "month",
  )}-${getDateTimeLocalPart(parts, "day")}T${getDateTimeLocalPart(
    parts,
    "hour",
  )}:${getDateTimeLocalPart(parts, "minute")}`;
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

function LatestIndicator({
  isLatest,
  label = "Yes",
  showWhenFalse = true,
}: {
  isLatest: boolean;
  label?: string;
  showWhenFalse?: boolean;
}) {
  if (isLatest) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-growth/40 bg-growth/10 px-2.5 py-1 text-xs font-semibold text-foreground">
        <CheckCircle2 aria-hidden="true" className="size-3.5 text-accent" />
        {label}
      </span>
    );
  }

  if (!showWhenFalse) {
    return null;
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

function LeadStatusPill({ status }: { status: string | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/35 bg-accent-soft/70 px-2.5 py-1 text-xs font-semibold text-accent">
      <Circle aria-hidden="true" className="size-2.5 fill-accent" />
      {getLeadStatusLabel(status)}
    </span>
  );
}

function LeadPriorityPill({ priority }: { priority: LeadPriority | null }) {
  const priorityValue = normalizeLeadPriority(priority);
  const priorityStyles: Record<LeadPriority, string> = {
    high: "border-accent/45 bg-accent-soft/80 text-accent",
    low: "border-border bg-background text-secondary",
    normal: "border-growth/35 bg-growth/10 text-foreground",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyles[priorityValue]}`}
    >
      <Circle
        aria-hidden="true"
        className={`size-2.5 ${priorityValue === "high" ? "fill-accent text-accent" : "fill-growth text-growth"}`}
      />
      {getLeadPriorityLabel(priorityValue)}
    </span>
  );
}

function FormField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-1.5 text-[0.68rem] font-semibold uppercase leading-4 text-secondary">
      {label}
      {children}
    </label>
  );
}

function LeadFollowUpPanel({
  lead,
  variant = "card",
}: {
  lead: LeadAssessmentRow;
  variant?: "card" | "table";
}) {
  const leadStatus = normalizeLeadStatus(lead.lead_status);
  const leadPriority = normalizeLeadPriority(lead.lead_priority);
  const controlClass =
    "min-h-10 w-full rounded-card border border-border bg-surface-soft px-3 py-2 text-sm leading-6 text-foreground outline-none transition focus:border-accent";

  return (
    <details
      className={`group overflow-hidden rounded-card border border-border/80 bg-background/55 ${
        variant === "table" ? "min-w-80" : ""
      }`}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 marker:hidden">
        <span className="grid min-w-0 gap-1">
          <span className="text-xs font-semibold uppercase leading-4 text-secondary">
            Follow-up
          </span>
          <span className="flex flex-wrap gap-2">
            <LeadStatusPill status={leadStatus} />
            <LeadPriorityPill priority={leadPriority} />
          </span>
        </span>
        <span className="shrink-0 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-secondary">
          Edit
        </span>
      </summary>

      <form
        action={updateLeadFollowUp}
        className="grid gap-3 border-t border-border/70 p-3"
      >
        <input name="assessment_id" type="hidden" value={lead.assessment_id} />

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Status">
            <select
              className={controlClass}
              defaultValue={leadStatus}
              name="lead_status"
            >
              {LEAD_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Priority">
            <select
              className={controlClass}
              defaultValue={leadPriority}
              name="lead_priority"
            >
              {LEAD_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Internal note">
          <textarea
            className={`${controlClass} min-h-24 resize-y`}
            defaultValue={lead.internal_note ?? ""}
            maxLength={1000}
            name="internal_note"
            placeholder="Private note, HQ-only"
            rows={3}
          />
        </FormField>

        <FormField label="Follow-up date/time">
          <input
            className={controlClass}
            defaultValue={formatDateTimeLocal(lead.follow_up_at)}
            name="follow_up_at"
            type="datetime-local"
          />
        </FormField>

        <div className="grid gap-1 text-xs leading-5 text-secondary">
          <p className="flex items-center gap-1.5">
            <PhoneCall aria-hidden="true" className="size-3.5" />
            Last contacted:{" "}
            <span className="font-semibold text-foreground">
              {formatOptionalDate(lead.last_contacted_at)}
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <CalendarClock aria-hidden="true" className="size-3.5" />
            Follow-up:{" "}
            <span className="font-semibold text-foreground">
              {formatOptionalDate(lead.follow_up_at)}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-card border border-accent/40 bg-accent px-3 py-2 text-sm font-semibold text-background transition hover:bg-foreground sm:flex-none"
            type="submit"
          >
            <Save aria-hidden="true" className="size-4" />
            Save update
          </button>
          <button
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-card border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground transition hover:border-accent/50 sm:flex-none"
            name="mark_contacted"
            type="submit"
            value="true"
          >
            <PhoneCall aria-hidden="true" className="size-4" />
            Mark contacted
          </button>
        </div>
      </form>
    </details>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-secondary">
      <span className="text-accent">{label}</span>
      <span className="min-w-0 break-words text-foreground">{value}</span>
    </span>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-card border border-border/70 bg-background/55 p-3">
      <dt className="text-[0.68rem] font-semibold uppercase leading-4 text-secondary">
        {label}
      </dt>
      <dd className="break-words text-sm leading-6 text-muted">{value}</dd>
    </div>
  );
}

function LeadMobileCard({ lead }: { lead: LeadAssessmentRow }) {
  const details = [
    [
      "Appliances",
      formatAppliancesWithQuantities(
        lead.appliances,
        lead.appliance_quantities,
        {
          includeSingleQuantities: true,
        },
      ),
    ],
    ["Runtime", lead.runtime],
    ["Budget", lead.budget],
    ["Date", formatDate(lead.assessment_created_at)],
  ];

  return (
    <article className="grid gap-4 rounded-card border border-border bg-surface/90 p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-semibold leading-tight text-foreground">
            {lead.customer_name}
          </h3>
          <p className="mt-1 break-words text-sm font-semibold leading-6 text-muted">
            {formatWhatsApp(lead.customer_whatsapp)}
          </p>
        </div>
        <LatestIndicator
          isLatest={lead.is_latest}
          label="Latest: Yes"
          showWhenFalse={false}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <MetaPill label="Source" value={formatSource(lead)} />
        <MetaPill label="Stage" value={lead.journey_stage} />
        <CommunityStatus status={lead.community_status} />
      </div>

      <LeadFollowUpPanel lead={lead} />

      <div className="rounded-card border border-accent/25 bg-accent-soft/60 p-3">
        <p className="text-xs font-semibold uppercase leading-4 text-accent">
          Recommendation
        </p>
        <p className="mt-1 break-words text-base font-semibold leading-6 text-foreground">
          {lead.recommendation_title}
        </p>
      </div>

      <dl className="grid gap-2">
        {details.map(([label, value]) => (
          <DetailItem key={label} label={label} value={value} />
        ))}
      </dl>
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
          Protected updates
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
                "Follow-up",
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
                  {formatAppliancesWithQuantities(
                    lead.appliances,
                    lead.appliance_quantities,
                    {
                      includeSingleQuantities: true,
                    },
                  )}
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
                <td className="max-w-64 border-b border-border/70 px-3 py-4 font-semibold leading-6 text-foreground">
                  {lead.recommendation_title}
                </td>
                <td className="border-b border-border/70 px-3 py-4">
                  <CommunityStatus status={lead.community_status} />
                </td>
                <td className="border-b border-border/70 px-3 py-4 pr-0">
                  <LatestIndicator isLatest={lead.is_latest} />
                </td>
                <td className="border-b border-border/70 px-3 py-4 pr-0">
                  <LeadFollowUpPanel lead={lead} variant="table" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
