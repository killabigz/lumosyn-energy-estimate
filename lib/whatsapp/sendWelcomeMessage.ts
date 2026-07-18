import "server-only";

import type { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  sendWhatsAppWelcomeTemplate,
  type WhatsAppWelcomeTemplateResult,
} from "@/lib/whatsapp/client";

const WHATSAPP_OPT_IN_SOURCE = "estimate_submission";
const WELCOME_ALLOWED_STATUSES = new Set([
  "allowed",
  "joined",
  "opted_in",
  "pending",
]);
const WELCOME_AUDIT_ERROR_MAX_LENGTH = 240;

type SupabaseServiceClient = ReturnType<typeof createSupabaseServiceClient>;

type WhatsAppWelcomeCustomerContext = {
  community_status: string | null;
  id: string;
  name: string | null;
  whatsapp: string | null;
  whatsapp_welcome_sent_at: string | null;
};

type WhatsAppWelcomeAssessmentContext = {
  id: string;
};

export type WhatsAppWelcomeMessageResult =
  | {
      ok: true;
      status: "sent";
      messageId?: string;
    }
  | {
      ok: true;
      status: "skipped";
      reason:
        | "already_sent"
        | "disabled"
        | "invalid_recipient"
        | "missing_config"
        | "missing_consent"
        | "missing_recipient";
    }
  | {
      ok: false;
      status: "failed";
      reason: "meta_api_error" | "network_error" | "status_update_error";
      statusCode?: number;
    };

type SendWelcomeMessageInput = {
  assessment: WhatsAppWelcomeAssessmentContext;
  customer: WhatsAppWelcomeCustomerContext;
  supabase: SupabaseServiceClient;
};

function warnWhatsApp(message: string) {
  console.warn(`[WhatsApp] ${message}`);
}

function hasWhatsAppWelcomeConsent(customer: WhatsAppWelcomeCustomerContext) {
  const status = customer.community_status?.trim().toLowerCase() ?? "";

  return WELCOME_ALLOWED_STATUSES.has(status);
}

function safeAuditError(value: string) {
  return value.slice(0, WELCOME_AUDIT_ERROR_MAX_LENGTH);
}

async function updateWelcomeAudit(
  supabase: SupabaseServiceClient,
  customerId: string,
  status: "failed" | "sent" | "skipped",
  errorMessage: string | null,
) {
  const { error } = await supabase
    .from("customers")
    .update({
      whatsapp_welcome_error: errorMessage
        ? safeAuditError(errorMessage)
        : null,
      whatsapp_welcome_status: status,
    })
    .eq("id", customerId);

  if (error) {
    warnWhatsApp("Welcome audit fields were not updated.");
  }
}

async function markWhatsAppWelcomeSent(
  supabase: SupabaseServiceClient,
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
    warnWhatsApp("Welcome sent timestamp was not recorded.");

    return false;
  }

  await updateWelcomeAudit(supabase, customerId, "sent", null);

  return true;
}

function mapTemplateResult(
  result: WhatsAppWelcomeTemplateResult,
): WhatsAppWelcomeMessageResult {
  if (result.status === "sent") {
    return {
      ok: true,
      messageId: result.messageId,
      status: "sent",
    };
  }

  return result;
}

async function recordTemplateOutcome(
  supabase: SupabaseServiceClient,
  customerId: string,
  result: WhatsAppWelcomeTemplateResult,
) {
  if (result.status === "sent") {
    return;
  }

  if (result.status === "skipped" && result.reason === "disabled") {
    return;
  }

  const errorMessage =
    result.status === "failed"
      ? `${result.reason}${result.statusCode ? `:${result.statusCode}` : ""}`
      : result.reason;

  await updateWelcomeAudit(supabase, customerId, result.status, errorMessage);
}

export async function sendWelcomeMessage(
  context: SendWelcomeMessageInput,
): Promise<WhatsAppWelcomeMessageResult> {
  try {
    if (!hasWhatsAppWelcomeConsent(context.customer)) {
      return {
        ok: true,
        reason: "missing_consent",
        status: "skipped",
      };
    }

    if (context.customer.whatsapp_welcome_sent_at) {
      return {
        ok: true,
        reason: "already_sent",
        status: "skipped",
      };
    }

    if (!context.customer.whatsapp) {
      return {
        ok: true,
        reason: "missing_recipient",
        status: "skipped",
      };
    }

    const templateResult = await sendWhatsAppWelcomeTemplate({
      customerName: context.customer.name,
      to: context.customer.whatsapp,
    });

    if (templateResult.status === "sent") {
      const wasRecorded = await markWhatsAppWelcomeSent(
        context.supabase,
        context.customer.id,
      );

      if (!wasRecorded) {
        return {
          ok: false,
          reason: "status_update_error",
          status: "failed",
        };
      }
    } else {
      await recordTemplateOutcome(
        context.supabase,
        context.customer.id,
        templateResult,
      );
    }

    return mapTemplateResult(templateResult);
  } catch {
    warnWhatsApp("Welcome message finished with an internal failure.");

    return {
      ok: false,
      reason: "network_error",
      status: "failed",
    };
  }
}
