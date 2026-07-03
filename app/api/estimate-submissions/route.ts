import { NextResponse } from "next/server";
import { mapTimelineToJourneyStage } from "@/lib/recommendation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const GENERIC_ERROR = "Unable to save estimate right now.";
const JAMAICAN_WHATSAPP_PATTERN = /^876\d{7}$/;

type EstimateSubmissionPayload = {
  name: string;
  whatsapp: string;
  email: string | null;
  goal: string;
  budget: string;
  appliances: string[];
  other_appliance: string | null;
  timeline: string;
  journey_stage: string;
  recommendation_id: string;
  recommendation_title: string;
  system_size_label: string;
  battery_label: string;
  inverter_label: string;
  solar_panel_label: string;
};

function jsonFailure(status: number) {
  return NextResponse.json(
    {
      ok: false,
      error: GENERIC_ERROR,
    },
    { status },
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRequiredText(body: Record<string, unknown>, key: string) {
  const value = body[key];

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getOptionalText(body: Record<string, unknown>, key: string) {
  const value = body[key];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getRequiredAppliances(body: Record<string, unknown>) {
  const value = body.appliances;

  if (!Array.isArray(value)) {
    return undefined;
  }

  const appliances = value
    .map((appliance) =>
      typeof appliance === "string" ? appliance.trim() : "",
    )
    .filter(Boolean);

  return appliances.length > 0 ? appliances : undefined;
}

function parseSubmissionPayload(body: unknown): EstimateSubmissionPayload | undefined {
  if (!isRecord(body)) {
    return undefined;
  }

  const name = getRequiredText(body, "name");
  const whatsapp = getRequiredText(body, "whatsapp");
  const goal = getRequiredText(body, "goal");
  const budget = getRequiredText(body, "budget");
  const appliances = getRequiredAppliances(body);
  const timeline = getRequiredText(body, "timeline");
  const recommendationId = getRequiredText(body, "recommendationId");
  const recommendationTitle = getRequiredText(body, "recommendationTitle");
  const systemSizeLabel = getRequiredText(body, "systemSizeLabel");
  const batteryLabel = getRequiredText(body, "batteryLabel");
  const inverterLabel = getRequiredText(body, "inverterLabel");
  const solarPanelLabel = getRequiredText(body, "solarPanelLabel");

  if (
    !name ||
    !whatsapp ||
    !goal ||
    !budget ||
    !appliances ||
    !timeline ||
    !recommendationId ||
    !recommendationTitle ||
    !systemSizeLabel ||
    !batteryLabel ||
    !inverterLabel ||
    !solarPanelLabel ||
    !JAMAICAN_WHATSAPP_PATTERN.test(whatsapp)
  ) {
    return undefined;
  }

  return {
    name,
    whatsapp,
    email: getOptionalText(body, "email"),
    goal,
    budget,
    appliances,
    other_appliance: getOptionalText(body, "otherAppliance"),
    timeline,
    journey_stage: mapTimelineToJourneyStage(timeline),
    recommendation_id: recommendationId,
    recommendation_title: recommendationTitle,
    system_size_label: systemSizeLabel,
    battery_label: batteryLabel,
    inverter_label: inverterLabel,
    solar_panel_label: solarPanelLabel,
  };
}

export async function POST(request: Request) {
  try {
    const payload = parseSubmissionPayload(await request.json());

    if (!payload) {
      return jsonFailure(400);
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("estimate_submissions")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data?.id) {
      return jsonFailure(500);
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
    });
  } catch {
    return jsonFailure(500);
  }
}
