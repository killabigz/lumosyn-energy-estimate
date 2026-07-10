"use client";

import {
  Archive,
  CalendarClock,
  Circle,
  PhoneCall,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { useFormStatus } from "react-dom";
import {
  archiveLeadAssessment,
  restoreLeadAssessment,
  updateLeadFollowUp,
} from "@/app/hq/actions";
import {
  getLeadPriorityLabel,
  getLeadStatusLabel,
  LEAD_PRIORITY_OPTIONS,
  LEAD_STATUS_OPTIONS,
  normalizeLeadPriority,
  normalizeLeadStatus,
  type LeadPriority,
  type LeadStatus,
} from "@/lib/hq/leadFollowUp";

type HqFollowUpContextValue = {
  openAssessmentId: string | null;
  setOpenAssessmentId: (assessmentId: string | null) => void;
};

type LeadFollowUpFields = {
  assessment_id: string;
  follow_up_at: string | null;
  internal_note: string | null;
  is_archived: boolean;
  last_contacted_at: string | null;
  lead_priority: LeadPriority | null;
  lead_status: LeadStatus | null;
};

const HqFollowUpContext = createContext<HqFollowUpContextValue | null>(null);

function useHqFollowUp() {
  const context = useContext(HqFollowUpContext);

  if (!context) {
    throw new Error("HqLeadFollowUpControls must be used inside provider.");
  }

  return context;
}

export function HqFollowUpProvider({ children }: { children: ReactNode }) {
  const [openAssessmentId, setOpenAssessmentId] = useState<string | null>(null);
  const value = useMemo(
    () => ({
      openAssessmentId,
      setOpenAssessmentId,
    }),
    [openAssessmentId],
  );

  return (
    <HqFollowUpContext.Provider value={value}>
      {children}
    </HqFollowUpContext.Provider>
  );
}

function hasValidDate(value: string | null): value is string {
  return !!value && !Number.isNaN(new Date(value).getTime());
}

function formatCompactDate(value: string | null) {
  if (!hasValidDate(value)) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "America/Jamaica",
  }).format(new Date(value));
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
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart(
    "day",
  )}T${getPart("hour")}:${getPart("minute")}`;
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

function SubmitButton({
  children,
  name,
  value,
  variant,
}: {
  children: ReactNode;
  name?: string;
  value?: string;
  variant: "primary" | "secondary";
}) {
  const { pending } = useFormStatus();
  const variantClass =
    variant === "primary"
      ? "border-accent/40 bg-accent text-background hover:bg-foreground"
      : "border-border bg-surface text-foreground hover:border-accent/50";

  return (
    <button
      className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-card border px-3 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-70 sm:flex-none ${variantClass}`}
      disabled={pending}
      name={name}
      type="submit"
      value={value}
    >
      {children}
    </button>
  );
}

function ArchiveSubmitButton({ isArchived }: { isArchived: boolean }) {
  const { pending } = useFormStatus();
  const Icon = isArchived ? RotateCcw : Archive;
  const label = isArchived ? "Restore" : "Archive";

  return (
    <button
      className="inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-semibold text-secondary transition hover:border-accent/45 hover:text-foreground disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {pending ? "Saving" : label}
    </button>
  );
}

function LeadArchiveForm({ lead }: { lead: LeadFollowUpFields }) {
  const action = lead.is_archived
    ? restoreLeadAssessment
    : archiveLeadAssessment;
  const confirmationMessage = lead.is_archived
    ? "Restore this assessment to the normal HQ lead list?"
    : "Archive this assessment and hide it from the normal HQ lead list?";

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmationMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input name="assessment_id" type="hidden" value={lead.assessment_id} />
      <ArchiveSubmitButton isArchived={lead.is_archived} />
    </form>
  );
}

function FollowUpSummary({
  isOpen,
  lead,
  onToggle,
  panelId,
}: {
  isOpen: boolean;
  lead: LeadFollowUpFields;
  onToggle: () => void;
  panelId: string;
}) {
  const followUpDate = formatCompactDate(lead.follow_up_at);
  const lastContactedDate = formatCompactDate(lead.last_contacted_at);

  return (
    <div className="grid gap-2">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase leading-4 text-secondary">
          Follow-up
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <LeadArchiveForm lead={lead} />
          <button
            aria-controls={panelId}
            aria-expanded={isOpen}
            className="inline-flex min-h-8 shrink-0 items-center justify-center rounded-full border border-accent/35 bg-accent-soft px-3 text-xs font-semibold text-accent transition hover:border-accent/70"
            onClick={onToggle}
            type="button"
          >
            {isOpen ? "Close" : "Edit"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <LeadStatusPill status={lead.lead_status} />
        <LeadPriorityPill priority={lead.lead_priority} />
      </div>

      {(followUpDate || lastContactedDate) && (
        <div className="grid gap-1 text-xs leading-5 text-secondary">
          {followUpDate && (
            <p className="flex items-center gap-1.5">
              <CalendarClock aria-hidden="true" className="size-3.5" />
              Follow-up:{" "}
              <span className="font-semibold text-foreground">
                {followUpDate}
              </span>
            </p>
          )}
          {lastContactedDate && (
            <p className="flex items-center gap-1.5">
              <PhoneCall aria-hidden="true" className="size-3.5" />
              Last contacted:{" "}
              <span className="font-semibold text-foreground">
                {lastContactedDate}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function LeadFollowUpEditor({
  lead,
  onClose,
  panelId,
  variant,
}: {
  lead: LeadFollowUpFields;
  onClose: () => void;
  panelId: string;
  variant: "card" | "table";
}) {
  const leadStatus = normalizeLeadStatus(lead.lead_status);
  const leadPriority = normalizeLeadPriority(lead.lead_priority);
  const controlClass =
    "min-h-10 w-full rounded-card border border-border bg-surface-soft px-3 py-2 text-sm leading-6 text-foreground outline-none transition focus:border-accent";
  const formClass =
    variant === "table"
      ? "grid gap-4 rounded-card border border-accent/25 bg-background/80 p-4 shadow-card"
      : "grid gap-3 rounded-card border border-accent/25 bg-background/70 p-3";

  async function handleSubmit(formData: FormData) {
    await updateLeadFollowUp(formData);
    onClose();
  }

  return (
    <form
      action={handleSubmit}
      className={formClass}
      data-hq-follow-up-editor={variant}
      id={panelId}
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

      <div className="flex flex-wrap gap-2">
        <SubmitButton variant="primary">
          <Save aria-hidden="true" className="size-4" />
          Save update
        </SubmitButton>
        <SubmitButton name="mark_contacted" value="true" variant="secondary">
          <PhoneCall aria-hidden="true" className="size-4" />
          Mark contacted
        </SubmitButton>
        <button
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-card border border-border bg-background px-3 py-2 text-sm font-semibold text-secondary transition hover:border-accent/50 hover:text-foreground sm:flex-none"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}

export function HqLeadFollowUpControls({
  lead,
  variant = "card",
}: {
  lead: LeadFollowUpFields;
  variant?: "card" | "table";
}) {
  const { openAssessmentId, setOpenAssessmentId } = useHqFollowUp();
  const isOpen = openAssessmentId === lead.assessment_id;
  const panelId = `lead-follow-up-${variant}-${lead.assessment_id}`;

  function toggleEditor() {
    setOpenAssessmentId(isOpen ? null : lead.assessment_id);
  }

  function closeEditor() {
    setOpenAssessmentId(null);
  }

  return (
    <div
      className={
        variant === "table"
          ? "w-56 max-w-56"
          : "grid gap-3 rounded-card border border-border/80 bg-background/55 p-3"
      }
      data-hq-follow-up={variant}
    >
      <FollowUpSummary
        isOpen={isOpen}
        lead={lead}
        onToggle={toggleEditor}
        panelId={panelId}
      />

      {isOpen && variant === "card" && (
        <LeadFollowUpEditor
          lead={lead}
          onClose={closeEditor}
          panelId={panelId}
          variant={variant}
        />
      )}
    </div>
  );
}

export function HqLeadFollowUpTableEditor({
  columnCount = 13,
  lead,
}: {
  columnCount?: number;
  lead: LeadFollowUpFields;
}) {
  const { openAssessmentId, setOpenAssessmentId } = useHqFollowUp();
  const isOpen = openAssessmentId === lead.assessment_id;

  if (!isOpen) {
    return null;
  }

  return (
    <tr>
      <td className="px-0 py-0" colSpan={columnCount}>
        <LeadFollowUpEditor
          lead={lead}
          onClose={() => setOpenAssessmentId(null)}
          panelId={`lead-follow-up-table-${lead.assessment_id}`}
          variant="table"
        />
      </td>
    </tr>
  );
}
