import "server-only";

const DEFAULT_API_VERSION = "v21.0";
const DEFAULT_WELCOME_TEMPLATE_LANGUAGE = "en_US";
const FALLBACK_TEMPLATE_CUSTOMER_NAME = "there";

type RequiredConfigName =
  | "WHATSAPP_ACCESS_TOKEN"
  | "WHATSAPP_PHONE_NUMBER_ID"
  | "WHATSAPP_WELCOME_TEMPLATE_NAME";

type WhatsAppConfig = {
  accessToken: string;
  apiVersion: string;
  phoneNumberId: string;
  welcomeTemplateLanguage: string;
  welcomeTemplateName: string;
};

export type WhatsAppWelcomeTemplateResult =
  | {
      ok: true;
      status: "sent";
      messageId?: string;
    }
  | {
      ok: true;
      status: "skipped";
      reason: "disabled" | "invalid_recipient" | "missing_config";
      missingConfig?: RequiredConfigName[];
    }
  | {
      ok: false;
      status: "failed";
      reason: "meta_api_error" | "network_error";
      statusCode?: number;
    };

type WelcomeTemplateInput = {
  customerName?: string | null;
  to: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getServerEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function warnWhatsApp(message: string) {
  console.warn(`[WhatsApp] ${message}`);
}

function readWhatsAppConfig():
  | { ok: true; config: WhatsAppConfig }
  | { ok: false; missingConfig: RequiredConfigName[] } {
  const accessToken = getServerEnv("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = getServerEnv("WHATSAPP_PHONE_NUMBER_ID");
  const welcomeTemplateName = getServerEnv("WHATSAPP_WELCOME_TEMPLATE_NAME");
  const missingConfig: RequiredConfigName[] = [];

  if (!accessToken) {
    missingConfig.push("WHATSAPP_ACCESS_TOKEN");
  }

  if (!phoneNumberId) {
    missingConfig.push("WHATSAPP_PHONE_NUMBER_ID");
  }

  if (!welcomeTemplateName) {
    missingConfig.push("WHATSAPP_WELCOME_TEMPLATE_NAME");
  }

  if (missingConfig.length > 0) {
    return {
      ok: false,
      missingConfig,
    };
  }

  return {
    ok: true,
    config: {
      accessToken,
      apiVersion: getServerEnv("WHATSAPP_API_VERSION") || DEFAULT_API_VERSION,
      phoneNumberId,
      welcomeTemplateLanguage:
        getServerEnv("WHATSAPP_WELCOME_TEMPLATE_LANGUAGE") ||
        DEFAULT_WELCOME_TEMPLATE_LANGUAGE,
      welcomeTemplateName,
    },
  };
}

export function isWhatsAppEnabled() {
  return getServerEnv("WHATSAPP_ENABLED").toLowerCase() === "true";
}

export function normalizeWhatsAppRecipientNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  if (/^876\d{7}$/.test(digits)) {
    return `1${digits}`;
  }

  if (/^\d{8,15}$/.test(digits)) {
    return digits;
  }

  return undefined;
}

function getTemplateCustomerName(name: string | null | undefined) {
  const trimmedName = name?.trim() ?? "";
  const firstName = trimmedName.split(/\s+/)[0]?.replace(/[<>]/g, "") ?? "";

  return firstName || FALLBACK_TEMPLATE_CUSTOMER_NAME;
}

function extractMessageId(payload: unknown) {
  if (!isRecord(payload) || !Array.isArray(payload.messages)) {
    return undefined;
  }

  const firstMessage = payload.messages.find(isRecord);

  if (!firstMessage) {
    return undefined;
  }

  return typeof firstMessage.id === "string" ? firstMessage.id : undefined;
}

export async function sendWhatsAppWelcomeTemplate({
  customerName,
  to,
}: WelcomeTemplateInput): Promise<WhatsAppWelcomeTemplateResult> {
  if (!isWhatsAppEnabled()) {
    return {
      ok: true,
      reason: "disabled",
      status: "skipped",
    };
  }

  const configResult = readWhatsAppConfig();

  if (!configResult.ok) {
    warnWhatsApp("Welcome message skipped because required config is missing.");

    return {
      ok: true,
      missingConfig: configResult.missingConfig,
      reason: "missing_config",
      status: "skipped",
    };
  }

  const recipient = normalizeWhatsAppRecipientNumber(to);

  if (!recipient) {
    return {
      ok: true,
      reason: "invalid_recipient",
      status: "skipped",
    };
  }

  const {
    accessToken,
    apiVersion,
    phoneNumberId,
    welcomeTemplateLanguage,
    welcomeTemplateName,
  } = configResult.config;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          template: {
            components: [
              {
                parameters: [
                  {
                    text: getTemplateCustomerName(customerName),
                    type: "text",
                  },
                ],
                type: "body",
              },
            ],
            language: {
              code: welcomeTemplateLanguage,
            },
            name: welcomeTemplateName,
          },
          to: recipient,
          type: "template",
        }),
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      warnWhatsApp(
        `Welcome message failed because Meta returned HTTP ${response.status}.`,
      );

      return {
        ok: false,
        reason: "meta_api_error",
        status: "failed",
        statusCode: response.status,
      };
    }

    return {
      ok: true,
      messageId: extractMessageId(await response.json().catch(() => null)),
      status: "sent",
    };
  } catch {
    warnWhatsApp(
      "Welcome message failed because the Meta request did not complete.",
    );

    return {
      ok: false,
      reason: "network_error",
      status: "failed",
    };
  }
}
