import "server-only";

const ALERT_REQUEST_TIMEOUT_MS = 2500;
const SUPPORTED_PROVIDER = "ntfy";

type NtfyConfig = {
  accessToken: string;
  serverUrl: string;
  topic: string;
};

type RequiredNtfyConfigName = "NTFY_SERVER_URL" | "NTFY_TOPIC";

export type InternalAlertPayload = {
  clickUrl?: string;
  message: string;
  title: string;
};

export type InternalAlertResult =
  | {
      ok: true;
      status: "sent";
    }
  | {
      ok: true;
      reason: "disabled" | "missing_config" | "unsupported_provider";
      status: "skipped";
    }
  | {
      ok: false;
      reason: "invalid_config" | "network_error" | "ntfy_api_error";
      status: "failed";
      statusCode?: number;
    };

function getServerEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function isInternalAlertsEnabled() {
  return getServerEnv("INTERNAL_ALERTS_ENABLED").toLowerCase() === "true";
}

function getInternalAlertsProvider() {
  return (
    getServerEnv("INTERNAL_ALERTS_PROVIDER").toLowerCase() ||
    SUPPORTED_PROVIDER
  );
}

function readNtfyConfig():
  | { ok: true; config: NtfyConfig }
  | { ok: false; missingConfig: RequiredNtfyConfigName[] } {
  const serverUrl = getServerEnv("NTFY_SERVER_URL");
  const topic = getServerEnv("NTFY_TOPIC");
  const missingConfig: RequiredNtfyConfigName[] = [];

  if (!serverUrl) {
    missingConfig.push("NTFY_SERVER_URL");
  }

  if (!topic) {
    missingConfig.push("NTFY_TOPIC");
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
      accessToken: getServerEnv("NTFY_ACCESS_TOKEN"),
      serverUrl,
      topic,
    },
  };
}

function buildNtfyTopicUrl(config: NtfyConfig) {
  try {
    const url = new URL(config.serverUrl);
    const basePath = url.pathname.replace(/\/+$/g, "");

    url.pathname = `${basePath}/${encodeURIComponent(config.topic)}`;
    url.search = "";
    url.hash = "";

    return url.toString();
  } catch {
    return undefined;
  }
}

function buildNtfyHeaders(
  alert: InternalAlertPayload,
  config: NtfyConfig,
) {
  const headers: Record<string, string> = {
    "Content-Type": "text/plain; charset=utf-8",
    Title: alert.title,
  };

  if (alert.clickUrl) {
    headers.Click = alert.clickUrl;
  }

  if (config.accessToken) {
    headers.Authorization = `Bearer ${config.accessToken}`;
  }

  return headers;
}

export async function sendInternalAlert(
  alert: InternalAlertPayload,
): Promise<InternalAlertResult> {
  if (!isInternalAlertsEnabled()) {
    return {
      ok: true,
      reason: "disabled",
      status: "skipped",
    };
  }

  if (getInternalAlertsProvider() !== SUPPORTED_PROVIDER) {
    console.warn("[alerts] Unsupported internal alerts provider; skipped.");

    return {
      ok: true,
      reason: "unsupported_provider",
      status: "skipped",
    };
  }

  const configResult = readNtfyConfig();

  if (!configResult.ok) {
    console.warn(
      `[alerts] Missing ntfy configuration: ${configResult.missingConfig.join(
        ", ",
      )}; skipped.`,
    );

    return {
      ok: true,
      reason: "missing_config",
      status: "skipped",
    };
  }

  const topicUrl = buildNtfyTopicUrl(configResult.config);

  if (!topicUrl) {
    console.warn("[alerts] Invalid ntfy server URL; skipped.");

    return {
      ok: false,
      reason: "invalid_config",
      status: "failed",
    };
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(
    () => abortController.abort(),
    ALERT_REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(topicUrl, {
      body: alert.message,
      headers: buildNtfyHeaders(alert, configResult.config),
      method: "POST",
      signal: abortController.signal,
    });

    if (!response.ok) {
      console.warn(`[alerts] ntfy request failed: ${response.status}.`);

      return {
        ok: false,
        reason: "ntfy_api_error",
        status: "failed",
        statusCode: response.status,
      };
    }

    return {
      ok: true,
      status: "sent",
    };
  } catch {
    console.warn("[alerts] ntfy request failed.");

    return {
      ok: false,
      reason: "network_error",
      status: "failed",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
