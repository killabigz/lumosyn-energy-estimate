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
  runtime: string;
  timeline: string;
  journey_stage: string;
  recommendation_id: string;
  recommendation_title: string;
  system_size_label: string;
  battery_label: string;
  inverter_label: string;
  solar_panel_label: string;
};

type CustomerRecord = {
  id: string;
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

function normalizeJamaicanWhatsApp(value: string) {
  const digits = value.replace(/\D/g, "");
  const localNumber =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  return JAMAICAN_WHATSAPP_PATTERN.test(localNumber)
    ? localNumber
    : undefined;
}

function includesOtherAppliance(appliances: string[]) {
  return appliances.some(
    (appliance) => appliance.trim().toLowerCase() === "other",
  );
}

function parseSubmissionPayload(
  body: unknown,
): EstimateSubmissionPayload | undefined {
  if (!isRecord(body)) {
    return undefined;
  }

  const name = getRequiredText(body, "name");
  const whatsapp = normalizeJamaicanWhatsApp(
    getRequiredText(body, "whatsapp") ?? "",
  );
  const goal = getRequiredText(body, "goal");
  const budget = getRequiredText(body, "budget");
  const appliances = getRequiredAppliances(body);
  const otherAppliance = getOptionalText(body, "otherAppliance");
  const runtime = getRequiredText(body, "runtime");
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
    !runtime ||
    !timeline ||
    !recommendationId ||
    !recommendationTitle ||
    !systemSizeLabel ||
    !batteryLabel ||
    !inverterLabel ||
    !solarPanelLabel ||
    (includesOtherAppliance(appliances) && !otherAppliance)
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
    other_appliance: otherAppliance,
    runtime,
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

async function getExistingCustomer(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  whatsapp: string,
) {
  const { data, error } = await supabase
    .from("customers")
    .select("id")
    .eq("whatsapp", whatsapp)
    .maybeSingle<CustomerRecord>();

  if (error) {
    throw error;
  }

  return data;
}

async function updateCustomer(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  customerId: string,
  payload: EstimateSubmissionPayload,
) {
  const { error } = await supabase
    .from("customers")
    .update({
      email: payload.email,
      journey_stage: payload.journey_stage,
      name: payload.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) {
    throw error;
  }
}

async function createCustomer(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  payload: EstimateSubmissionPayload,
) {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      email: payload.email,
      journey_stage: payload.journey_stage,
      name: payload.name,
      whatsapp: payload.whatsapp,
    })
    .select("id")
    .single<CustomerRecord>();

  if (error || !data?.id) {
    throw error ?? new Error("Customer was not created.");
  }

  return data;
}

async function resolveCustomer(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  payload: EstimateSubmissionPayload,
) {
  const existingCustomer = await getExistingCustomer(supabase, payload.whatsapp);

  if (existingCustomer) {
    await updateCustomer(supabase, existingCustomer.id, payload);

    return existingCustomer;
  }

  try {
    return await createCustomer(supabase, payload);
  } catch {
    const customer = await getExistingCustomer(supabase, payload.whatsapp);

    if (!customer) {
      throw new Error("Customer was not available.");
    }

    await updateCustomer(supabase, customer.id, payload);

    return customer;
  }
}

async function createAssessment(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  customerId: string,
  payload: EstimateSubmissionPayload,
) {
  const { error: updateError } = await supabase
    .from("assessments")
    .update({ is_latest: false })
    .eq("customer_id", customerId)
    .eq("is_latest", true);

  if (updateError) {
    throw updateError;
  }

  const { data, error } = await supabase
    .from("assessments")
    .insert({
      appliances: payload.appliances,
      battery_label: payload.battery_label,
      budget: payload.budget,
      customer_id: customerId,
      goal: payload.goal,
      inverter_label: payload.inverter_label,
      is_latest: true,
      journey_stage: payload.journey_stage,
      other_appliance: payload.other_appliance,
      recommendation_id: payload.recommendation_id,
      recommendation_title: payload.recommendation_title,
      runtime: payload.runtime,
      solar_panel_label: payload.solar_panel_label,
      system_size_label: payload.system_size_label,
      timeline: payload.timeline,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw error ?? new Error("Assessment was not created.");
  }
}

export async function POST(request: Request) {
  try {
    const payload = parseSubmissionPayload(await request.json());

    if (!payload) {
      return jsonFailure(400);
    }

    const supabase = createSupabaseServiceClient();
    const customer = await resolveCustomer(supabase, payload);
    await createAssessment(supabase, customer.id, payload);

    return NextResponse.json({
      ok: true,
    });
  } catch {
    return jsonFailure(500);
  }
}
