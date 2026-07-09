export const LEAD_STATUS_OPTIONS = [
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Follow-up", value: "follow_up" },
  { label: "Quoted", value: "quoted" },
  { label: "Closed won", value: "closed_won" },
  { label: "Closed lost", value: "closed_lost" },
  { label: "Not ready", value: "not_ready" },
] as const;

export const LEAD_PRIORITY_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Normal", value: "normal" },
  { label: "High", value: "high" },
] as const;

export type LeadStatus = (typeof LEAD_STATUS_OPTIONS)[number]["value"];
export type LeadPriority = (typeof LEAD_PRIORITY_OPTIONS)[number]["value"];

export const DEFAULT_LEAD_STATUS: LeadStatus = "new";
export const DEFAULT_LEAD_PRIORITY: LeadPriority = "normal";

const LEAD_STATUS_VALUES = new Set<string>(
  LEAD_STATUS_OPTIONS.map((option) => option.value),
);
const LEAD_PRIORITY_VALUES = new Set<string>(
  LEAD_PRIORITY_OPTIONS.map((option) => option.value),
);

export function isLeadStatus(value: string): value is LeadStatus {
  return LEAD_STATUS_VALUES.has(value);
}

export function isLeadPriority(value: string): value is LeadPriority {
  return LEAD_PRIORITY_VALUES.has(value);
}

export function normalizeLeadStatus(value: string | null | undefined) {
  return value && isLeadStatus(value) ? value : DEFAULT_LEAD_STATUS;
}

export function normalizeLeadPriority(value: string | null | undefined) {
  return value && isLeadPriority(value) ? value : DEFAULT_LEAD_PRIORITY;
}

export function getLeadStatusLabel(value: string | null | undefined) {
  const normalizedValue = normalizeLeadStatus(value);

  return (
    LEAD_STATUS_OPTIONS.find((option) => option.value === normalizedValue)
      ?.label ?? "New"
  );
}

export function getLeadPriorityLabel(value: string | null | undefined) {
  const normalizedValue = normalizeLeadPriority(value);

  return (
    LEAD_PRIORITY_OPTIONS.find((option) => option.value === normalizedValue)
      ?.label ?? "Normal"
  );
}
