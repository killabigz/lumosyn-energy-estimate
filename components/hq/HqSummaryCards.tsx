import {
  CalendarClock,
  CircleDashed,
  ClipboardList,
  MessageCircle,
  Radio,
  Users,
} from "lucide-react";
import type { HqSummary } from "@/lib/hq/types";

type SummaryCard = {
  detail: string;
  icon: typeof Users;
  label: string;
  value: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "None yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Jamaica",
  }).format(new Date(value));
}

export function HqSummaryCards({ summary }: { summary: HqSummary }) {
  const cards: SummaryCard[] = [
    {
      detail: "Saved customer records",
      icon: Users,
      label: "Total customers",
      value: formatNumber(summary.totalCustomers),
    },
    {
      detail: "Submitted estimate assessments",
      icon: ClipboardList,
      label: "Total assessments",
      value: formatNumber(summary.totalAssessments),
    },
    {
      detail: "Community status is joined",
      icon: MessageCircle,
      label: "Joined WhatsApp",
      value: formatNumber(summary.joinedWhatsAppCount),
    },
    {
      detail: "Community status is pending",
      icon: CircleDashed,
      label: "Pending WhatsApp",
      value: formatNumber(summary.pendingWhatsAppCount),
    },
    {
      detail: "Most recent assessment",
      icon: CalendarClock,
      label: "Latest assessment",
      value: formatDate(summary.latestAssessmentDate),
    },
    {
      detail: "From latest tracked assessments",
      icon: Radio,
      label: "Top traffic source",
      value: summary.topTrafficSource ?? "None yet",
    },
  ];

  return (
    <section
      aria-label="HQ summary"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            className="grid min-h-36 gap-4 rounded-card border border-border bg-surface/90 p-5 shadow-card"
            key={card.label}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-1">
                <h2 className="text-sm font-semibold text-secondary">
                  {card.label}
                </h2>
                <p className="text-2xl font-semibold leading-tight text-foreground">
                  {card.value}
                </p>
              </div>
              <span className="inline-flex size-10 items-center justify-center rounded-card border border-accent/30 bg-accent-soft text-accent">
                <Icon aria-hidden="true" className="size-5" />
              </span>
            </div>
            <p className="text-sm leading-6 text-muted">{card.detail}</p>
          </article>
        );
      })}
    </section>
  );
}
