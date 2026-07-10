import { NextResponse } from "next/server";
import { sendInternalAlert } from "@/lib/alerts/client";
import { buildNewLeadAlert } from "@/lib/alerts/leadAlert";
import { parseTrackingPayload, type TrackingContext } from "@/lib/analytics/utm";
import { normalizePhoneDigits } from "@/lib/customerIdentity/phone";
import { mapTimelineToJourneyStage } from "@/lib/recommendation";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  isWhatsAppEnabled,
  sendWhatsAppWelcomeTemplate,
} from "@/lib/whatsapp/client";

const GENERIC_ERROR = "Unable to save estimate right now.";
const JAMAICAN_WHATSAPP_PATTERN = /^876\d{7}$/;
const WHATSAPP_OPT_IN_SOURCE = "estimate_submission";
const APPLIANCE_QUANTITY_MINIMUM = 1;
const APPLIANCE_QUANTITY_MAXIMUM = 10;
const CUSTOMER_SELECT =
  "id, created_at, community_status, email, name, phone_normalized, whatsapp_welcome_sent_at";
const PLACEHOLDER_CUSTOMER_NAMES = new Set([
  "customer",
  "lead",
  "n/a",
  "na",
  "none",
  "unknown",
]);

type ApplianceQuantities = Record<string, number>;

type EstimateSubmissionPayload = {
  name: string;
  whatsapp: string;
  phone_normalized: string;
  email: string | null;
  goal: string;
  budget: string;
  appliances: string[];
  appliance_quantities: ApplianceQuantities | null;
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
} & TrackingContext;

type CustomerRecord = {
  community_status: string;
  created_at: string;
  email: string | null;
  id: string;
  name: string;
  phone_normalized: string | null;
  whatsapp_welcome_sent_at: string | null;
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

function clampApplianceQuantity(quantity: number) {
  return Math.min(
    APPLIANCE_QUANTITY_MAXIMUM,
    Math.max(APPLIANCE_QUANTITY_MINIMUM, quantity),
  );
}

function getOptionalApplianceQuantities(
  body: Record<string, unknown>,
  appliances: string[],
) {
  const value = body.appliance_quantities;

  if (value === undefined || value === null) {
    return null;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const quantities: ApplianceQuantities = {};

  for (const appliance of appliances) {
    const rawQuantity = value[appliance];

    if (rawQuantity === undefined || rawQuantity === null) {
      quantities[appliance] = APPLIANCE_QUANTITY_MINIMUM;
      continue;
    }

    if (
      typeof rawQuantity !== "number" ||
      !Number.isFinite(rawQuantity) ||
      !Number.isInteger(rawQuantity)
    ) {
      return undefined;
    }

    quantities[appliance] = clampApplianceQuantity(rawQuantity);
  }

  return quantities;
}

function normalizeJamaicanWhatsApp(value: string) {
  const digits = value.replace(/\D/g, "");
  const localNumber =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  return JAMAICAN_WHATSAPP_PATTERN.test(localNumber)
    ? localNumber
    : undefined;
}

function isPlaceholderCustomerName(value: string | null | undefined) {
  const normalizedName = value?.trim().toLowerCase() ?? "";

  return !normalizedName || PLACEHOLDER_CUSTOMER_NAMES.has(normalizedName);
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
  const phoneNormalized = whatsapp ? normalizePhoneDigits(whatsapp) : null;
  const goal = getRequiredText(body, "goal");
  const budget = getRequiredText(body, "budget");
  const appliances = getRequiredAppliances(body);
  const applianceQuantities = appliances
    ? getOptionalApplianceQuantities(body, appliances)
    : undefined;
  const otherAppliance = getOptionalText(body, "otherAppliance");
  const runtime = getRequiredText(body, "runtime");
  const timeline = getRequiredText(body, "timeline");
  const recommendationId = getRequiredText(body, "recommendationId");
  const recommendationTitle = getRequiredText(body, "recommendationTitle");
  const systemSizeLabel = getRequiredText(body, "systemSizeLabel");
  const batteryLabel = getRequiredText(body, "batteryLabel");
  const inverterLabel = getRequiredText(body, "inverterLabel");
  const solarPanelLabel = getRequiredText(body, "solarPanelLabel");
  const trackingPayload = parseTrackingPayload(body);

  if (
    !name ||
    !whatsapp ||
    !phoneNormalized ||
    !goal ||
    !budget ||
    !appliances ||
    applianceQuantities === undefined ||
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
    phone_normalized: phoneNormalized,
    email: getOptionalText(body, "email"),
    goal,
    budget,
    appliances,
    appliance_quantities: applianceQuantities,
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
    ...trackingPayload,
  };
}

async function getExistingCustomer(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  phoneNormalized: string,
  whatsapp: string,
) {
  const byPhone = await supabase
    .from("customers")
    .select(CUSTOMER_SELECT)
    .eq("phone_normalized", phoneNormalized)
    .order("created_at", { ascending: true })
    .limit(1)
    .returns<CustomerRecord[]>();

  if (byPhone.error) {
    throw byPhone.error;
  }

  if (byPhone.data?.[0]) {
    return byPhone.data[0];
  }

  const byWhatsApp = await supabase
    .from("customers")
    .select(CUSTOMER_SELECT)
    .eq("whatsapp", whatsapp)
    .maybeSingle<CustomerRecord>();

  if (byWhatsApp.error) {
    throw byWhatsApp.error;
  }

  return byWhatsApp.data;
}

async function updateCustomer(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  customer: CustomerRecord,
  payload: EstimateSubmissionPayload,
) {
  const updatePayload: {
    email?: string | null;
    journey_stage: string;
    name?: string;
    phone_normalized?: string;
    updated_at: string;
  } = {
    journey_stage: payload.journey_stage,
    updated_at: new Date().toISOString(),
  };

  if (payload.email) {
    updatePayload.email = payload.email;
  }

  if (isPlaceholderCustomerName(customer.name)) {
    updatePayload.name = payload.name;
  }

  if (customer.phone_normalized !== payload.phone_normalized) {
    updatePayload.phone_normalized = payload.phone_normalized;
  }

  const { error } = await supabase
    .from("customers")
    .update(updatePayload)
    .eq("id", customer.id);

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
      phone_normalized: payload.phone_normalized,
      whatsapp: payload.whatsapp,
    })
    .select(CUSTOMER_SELECT)
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
  const existingCustomer = await getExistingCustomer(
    supabase,
    payload.phone_normalized,
    payload.whatsapp,
  );

  if (existingCustomer) {
    await updateCustomer(supabase, existingCustomer, payload);

    return existingCustomer;
  }

  try {
    return await createCustomer(supabase, payload);
  } catch {
    const customer = await getExistingCustomer(
      supabase,
      payload.phone_normalized,
      payload.whatsapp,
    );

    if (!customer) {
      throw new Error("Customer was not available.");
    }

    await updateCustomer(supabase, customer, payload);

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
      appliance_quantities: payload.appliance_quantities,
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
      referrer: payload.referrer,
      runtime: payload.runtime,
      solar_panel_label: payload.solar_panel_label,
      source: payload.source,
      system_size_label: payload.system_size_label,
      timeline: payload.timeline,
      utm_campaign: payload.utm_campaign,
      utm_content: payload.utm_content,
      utm_medium: payload.utm_medium,
      utm_source: payload.utm_source,
      utm_term: payload.utm_term,
      landing_page: payload.landing_page,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw error ?? new Error("Assessment was not created.");
  }
}

function shouldSendWhatsAppWelcome(customer: CustomerRecord) {
  return (
    isWhatsAppEnabled() &&
    customer.community_status === "pending" &&
    !customer.whatsapp_welcome_sent_at
  );
}

async function markWhatsAppWelcomeSent(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  customerId: string,
) {
  const { error } = await supabase
    .from("customers")
    .update({
      whatsapp_opt_in_source: WHATSAPP_OPT_IN_SOURCE,
      whatsapp_welcome_sent_at: new Date().toISOString(),
    })
    .eq("id", customerId)
    .is("whatsapp_welcome_sent_at", null);

  if (error) {
    throw error;
  }
}

async function sendWhatsAppWelcomeAfterEstimate(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  customer: CustomerRecord,
  payload: EstimateSubmissionPayload,
) {
  if (!shouldSendWhatsAppWelcome(customer)) {
    return;
  }

  const result = await sendWhatsAppWelcomeTemplate({
    customerName: payload.name,
    to: payload.whatsapp,
  });

  if (result.status === "sent") {
    await markWhatsAppWelcomeSent(supabase, customer.id);
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
    await sendInternalAlert(
      buildNewLeadAlert({
        applianceQuantities: payload.appliance_quantities,
        appliances: payload.appliances,
        journeyStage: payload.journey_stage,
        recommendationTitle: payload.recommendation_title,
        source: payload.source,
      }),
    ).catch(() => undefined);
    await sendWhatsAppWelcomeAfterEstimate(supabase, customer, payload).catch(
      () => undefined,
    );

    return NextResponse.json({
      ok: true,
    });
  } catch {
    return jsonFailure(500);
  }
}
