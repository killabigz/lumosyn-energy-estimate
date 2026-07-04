import "server-only";

const DEFAULT_API_VERSION = "v21.0";
const WELCOME_LANGUAGE_CODE = "en";

type RequiredConfigName =
  | "WHATSAPP_ACCESS_TOKEN"
  | "WHATSAPP_PHONE_NUMBER_ID"
  | "WHATSAPP_WELCOME_TEMPLATE_NAME";

type WhatsAppConfig = {
  accessToken: string;
  apiVersion: string;
  phoneNumberId: string;
  welcomeTemplateName: string;
};

export type WhatsAppWelcomeResult =
  | {
      ok: true;
      status: "sent";
      messageId?: string;
    }
  | {
      ok: true;
      status: "skipped";
      reason: "disabled";
    }
  | {
      ok: false;
      status: "failed";
      reason: "invalid_recipient" | "meta_api_error" | "missing_config" | "network_error";
      missingConfig?: RequiredConfigName[];
      statusCode?: number;
    };

type WelcomeTemplateInput = {
  customerName: string;
  to: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getServerEnv(name: string) {
  return process.env[name]?.trim() ?? "";
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

function getTemplateCustomerName(name: string) {
  const trimmedName = name.trim();

  return trimmedName.split(/\s+/)[0] || trimmedName;
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
}: WelcomeTemplateInput): Promise<WhatsAppWelcomeResult> {
  if (!isWhatsAppEnabled()) {
    return {
      ok: true,
      reason: "disabled",
      status: "skipped",
    };
  }

  const configResult = readWhatsAppConfig();

  if (!configResult.ok) {
    return {
      ok: false,
      missingConfig: configResult.missingConfig,
      reason: "missing_config",
      status: "failed",
    };
  }

  const recipient = normalizeWhatsAppRecipientNumber(to);

  if (!recipient) {
    return {
      ok: false,
      reason: "invalid_recipient",
      status: "failed",
    };
  }

  const { accessToken, apiVersion, phoneNumberId, welcomeTemplateName } =
    configResult.config;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        body: JSON.stringify({
          messaging_product: "whatsapp",
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
              code: WELCOME_LANGUAGE_CODE,
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
    return {
      ok: false,
      reason: "network_error",
      status: "failed",
    };
  }
}
