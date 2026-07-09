import type { LeadPriority, LeadStatus } from "@/lib/hq/leadFollowUp";

export type ApplianceQuantities = Record<string, number>;

export type LeadAssessmentRow = {
  appliances: string[] | null;
  appliance_quantities: ApplianceQuantities | null;
  assessment_created_at: string;
  assessment_id: string;
  battery_label: string | null;
  budget: string;
  community_status: string;
  customer_id: string;
  customer_name: string;
  customer_whatsapp: string;
  follow_up_at: string | null;
  goal: string;
  internal_note: string | null;
  inverter_label: string | null;
  is_latest: boolean;
  journey_stage: string;
  last_contacted_at: string | null;
  lead_priority: LeadPriority | null;
  lead_status: LeadStatus | null;
  lead_updated_at: string | null;
  recommendation_title: string;
  runtime: string;
  solar_panel_label: string | null;
  source: string | null;
  timeline: string | null;
  utm_campaign: string | null;
  utm_medium: string | null;
  utm_source: string | null;
};

export type HqSummary = {
  joinedWhatsAppCount: number;
  latestAssessmentDate: string | null;
  pendingWhatsAppCount: number;
  topTrafficSource: string | null;
  totalAssessments: number;
  totalCustomers: number;
};

export type HqOverview = {
  latestLeads: LeadAssessmentRow[];
  summary: HqSummary;
};
