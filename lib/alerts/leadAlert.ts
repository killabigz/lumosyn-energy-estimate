import "server-only";

const MAX_ALERT_FIELD_LENGTH = 80;
const MAX_APPLIANCE_ITEMS = 5;

type ApplianceQuantities = Record<string, number> | null;

export type NewLeadAlertContext = {
  applianceQuantities: ApplianceQuantities;
  appliances: readonly string[];
  journeyStage: string;
  recommendationTitle: string;
  source: string;
};

function getServerEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function cleanAlertField(value: string, fallback: string) {
  const cleaned = value
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, MAX_ALERT_FIELD_LENGTH);

  return cleaned || fallback;
}

function cleanSource(value: string) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, MAX_ALERT_FIELD_LENGTH);

  return cleaned || "web_estimate";
}

function getSafeHqUrl() {
  const hqUrl = getServerEnv("NEXT_PUBLIC_HQ_URL");

  if (!hqUrl) {
    return undefined;
  }

  if (hqUrl.startsWith("/") && !hqUrl.startsWith("//")) {
    return hqUrl;
  }

  try {
    const url = new URL(hqUrl);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function getApplianceQuantity(
  applianceQuantities: ApplianceQuantities,
  appliance: string,
) {
  const quantity = applianceQuantities?.[appliance];

  return typeof quantity === "number" &&
    Number.isInteger(quantity) &&
    quantity > 0
    ? quantity
    : 1;
}

function buildApplianceSummary({
  applianceQuantities,
  appliances,
}: Pick<NewLeadAlertContext, "applianceQuantities" | "appliances">) {
  const items = appliances
    .slice(0, MAX_APPLIANCE_ITEMS)
    .map((appliance) => {
      const label = cleanAlertField(appliance, "Appliance");
      const quantity = getApplianceQuantity(applianceQuantities, appliance);

      return `${label} x${quantity}`;
    });

  if (appliances.length > MAX_APPLIANCE_ITEMS) {
    items.push(`+${appliances.length - MAX_APPLIANCE_ITEMS} more`);
  }

  return items.join(", ");
}

export function buildNewLeadAlert(context: NewLeadAlertContext) {
  const hqUrl = getSafeHqUrl();
  const messageLines = [
    `${cleanAlertField(
      context.recommendationTitle,
      "New estimate",
    )} | Source: ${cleanSource(context.source)} | Stage: ${cleanAlertField(
      context.journeyStage,
      "Unknown",
    )}`,
  ];
  const applianceSummary = buildApplianceSummary(context);

  if (applianceSummary) {
    messageLines.push(`Appliances: ${applianceSummary}`);
  }

  messageLines.push(
    hqUrl ? `Open HQ to review: ${hqUrl}` : "Open HQ to review.",
  );

  return {
    clickUrl: hqUrl,
    message: messageLines.join("\n"),
    title: "New Lumosyn lead",
  };
}
