import "server-only";

import { cache } from "react";
import type { HqOverview, LeadAssessmentRow } from "@/lib/hq/types";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const LATEST_LEADS_LIMIT = 25;
const SOURCE_SAMPLE_LIMIT = 500;

type SupabaseResult = {
  error: Error | null;
};

function assertSupabaseResult(result: SupabaseResult, label: string) {
  if (result.error) {
    throw new Error(`Unable to load Lumosyn HQ ${label}.`);
  }
}

function normalizeCount(count: number | null) {
  return count ?? 0;
}

function getTrafficSource(row: Pick<LeadAssessmentRow, "source" | "utm_source">) {
  return row.utm_source?.trim() || row.source?.trim() || "direct";
}

function getTopTrafficSource(
  sourceRows: Pick<LeadAssessmentRow, "source" | "utm_source">[],
) {
  if (sourceRows.length === 0) {
    return null;
  }

  const counts = new Map<string, number>();

  for (const row of sourceRows) {
    const source = getTrafficSource(row);
    counts.set(source, (counts.get(source) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export const getHqOverview = cache(async (): Promise<HqOverview> => {
  const supabase = createSupabaseServiceClient();

  const [
    latestLeadsResult,
    sourceRowsResult,
    assessmentsCountResult,
    customersCountResult,
    joinedWhatsAppCountResult,
    pendingWhatsAppCountResult,
  ] = await Promise.all([
    supabase
      .from("lead_assessments")
      .select(
        [
          "assessment_id",
          "assessment_created_at",
          "customer_id",
          "customer_name",
          "customer_whatsapp",
          "phone_normalized",
          "assessment_count_for_customer",
          "community_status",
          "goal",
          "appliances",
          "appliance_quantities",
          "runtime",
          "budget",
          "timeline",
          "journey_stage",
          "recommendation_title",
          "inverter_label",
          "battery_label",
          "solar_panel_label",
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "source",
          "is_latest",
          "lead_status",
          "lead_priority",
          "internal_note",
          "last_contacted_at",
          "follow_up_at",
          "lead_updated_at",
          "is_archived",
          "archived_at",
          "archived_reason",
        ].join(","),
      )
      .eq("is_archived", false)
      .order("assessment_created_at", { ascending: false })
      .limit(LATEST_LEADS_LIMIT)
      .returns<LeadAssessmentRow[]>(),
    supabase
      .from("lead_assessments")
      .select("source, utm_source")
      .eq("is_archived", false)
      .order("assessment_created_at", { ascending: false })
      .limit(SOURCE_SAMPLE_LIMIT)
      .returns<Pick<LeadAssessmentRow, "source" | "utm_source">[]>(),
    supabase
      .from("lead_assessments")
      .select("assessment_id", { count: "exact", head: true }),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("community_status", "joined"),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("community_status", "pending"),
  ]);

  assertSupabaseResult(latestLeadsResult, "latest leads");
  assertSupabaseResult(sourceRowsResult, "traffic sources");
  assertSupabaseResult(assessmentsCountResult, "assessment count");
  assertSupabaseResult(customersCountResult, "customer count");
  assertSupabaseResult(joinedWhatsAppCountResult, "joined WhatsApp count");
  assertSupabaseResult(pendingWhatsAppCountResult, "pending WhatsApp count");

  const latestLeads = latestLeadsResult.data ?? [];

  return {
    latestLeads,
    summary: {
      joinedWhatsAppCount: normalizeCount(joinedWhatsAppCountResult.count),
      latestAssessmentDate: latestLeads[0]?.assessment_created_at ?? null,
      pendingWhatsAppCount: normalizeCount(pendingWhatsAppCountResult.count),
      topTrafficSource: getTopTrafficSource(sourceRowsResult.data ?? []),
      totalAssessments: normalizeCount(assessmentsCountResult.count),
      totalCustomers: normalizeCount(customersCountResult.count),
    },
  };
});
