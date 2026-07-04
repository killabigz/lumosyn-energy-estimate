import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const JAMAICAN_WHATSAPP_PATTERN = /^876\d{7}$/;
const OPT_IN_REPLIES = new Set(["YES", "Y", "JOIN", "START"]);
const OPT_OUT_REPLIES = new Set(["NO", "N", "STOP", "UNSUBSCRIBE"]);

type IncomingWhatsAppMessage = {
  senderWhatsApp: string;
  text: string;
  timestamp: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getServerEnv(name: "WHATSAPP_VERIFY_TOKEN") {
  return process.env[name]?.trim() ?? "";
}

function getTextField(record: Record<string, unknown>, key: string) {
  const value = record[key];

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeCustomerWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  const localNumber =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  return JAMAICAN_WHATSAPP_PATTERN.test(localNumber)
    ? localNumber
    : undefined;
}

function extractMessageText(message: Record<string, unknown>) {
  const text = message.text;

  if (!isRecord(text)) {
    return undefined;
  }

  return getTextField(text, "body");
}

function extractIncomingMessages(payload: unknown) {
  const messages: IncomingWhatsAppMessage[] = [];

  if (!isRecord(payload) || !Array.isArray(payload.entry)) {
    return messages;
  }

  for (const entry of payload.entry) {
    if (!isRecord(entry) || !Array.isArray(entry.changes)) {
      continue;
    }

    for (const change of entry.changes) {
      if (!isRecord(change) || !isRecord(change.value)) {
        continue;
      }

      const rawMessages = change.value.messages;

      if (!Array.isArray(rawMessages)) {
        continue;
      }

      for (const rawMessage of rawMessages) {
        if (!isRecord(rawMessage)) {
          continue;
        }

        const senderWhatsApp = normalizeCustomerWhatsAppNumber(
          getTextField(rawMessage, "from") ?? "",
        );
        const text = extractMessageText(rawMessage);

        if (!senderWhatsApp || !text) {
          continue;
        }

        messages.push({
          senderWhatsApp,
          text,
          timestamp: getTextField(rawMessage, "timestamp") ?? null,
        });
      }
    }
  }

  return messages;
}

function getCommunityStatusForReply(text: string) {
  const normalizedReply = text.trim().toUpperCase();

  if (OPT_IN_REPLIES.has(normalizedReply)) {
    return "joined";
  }

  if (OPT_OUT_REPLIES.has(normalizedReply)) {
    return "opted_out";
  }

  return null;
}

function isJsonRequest(request: Request) {
  return (
    request.headers.get("content-type")?.toLowerCase().includes("application/json") ??
    false
  );
}

async function updateCustomerFromReply(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  message: IncomingWhatsAppMessage,
) {
  const communityStatus = getCommunityStatusForReply(message.text);
  const updatePayload: {
    community_status?: string;
    whatsapp_last_reply: string;
    whatsapp_last_reply_at: string;
  } = {
    whatsapp_last_reply: message.text,
    whatsapp_last_reply_at: new Date().toISOString(),
  };

  if (communityStatus) {
    updatePayload.community_status = communityStatus;
  }

  const { error } = await supabase
    .from("customers")
    .update(updatePayload)
    .eq("whatsapp", message.senderWhatsApp);

  if (error) {
    throw error;
  }
}

export function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get("hub.mode");
  const verifyToken = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    challenge &&
    verifyToken === getServerEnv("WHATSAPP_VERIFY_TOKEN")
  ) {
    return new NextResponse(challenge, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      status: 200,
    });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  if (!isJsonRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 415 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const messages = extractIncomingMessages(payload);

  if (messages.length === 0) {
    return NextResponse.json({ ok: true });
  }

  try {
    const supabase = createSupabaseServiceClient();

    await Promise.all(
      messages.map((message) => updateCustomerFromReply(supabase, message)),
    );
  } catch {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
