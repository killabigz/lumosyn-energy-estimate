import { NextResponse } from "next/server";

const CAMPAIGN_NAME = "launch_v1";

const campaignSources = {
  direct: {
    utm_medium: "manual",
    utm_source: "direct",
  },
  facebook: {
    utm_medium: "post",
    utm_source: "facebook",
  },
  instagram: {
    utm_medium: "bio",
    utm_source: "instagram",
  },
  tiktok: {
    utm_medium: "bio",
    utm_source: "tiktok",
  },
  whatsapp: {
    utm_medium: "status",
    utm_source: "whatsapp",
  },
} as const;

type CampaignSource = keyof typeof campaignSources;

type GoRouteContext = {
  params: Promise<{
    source: string;
  }>;
};

function getCampaignSource(source: string) {
  const normalizedSource = source.toLowerCase();

  return (
    campaignSources[normalizedSource as CampaignSource] ?? {
      utm_medium: "unknown",
      utm_source: "direct",
    }
  );
}

export async function GET(request: Request, { params }: GoRouteContext) {
  const { source } = await params;
  const campaignSource = getCampaignSource(source);
  const estimateUrl = new URL("/estimate", request.url);

  estimateUrl.search = new URLSearchParams({
    utm_source: campaignSource.utm_source,
    utm_medium: campaignSource.utm_medium,
    utm_campaign: CAMPAIGN_NAME,
  }).toString();

  return NextResponse.redirect(estimateUrl);
}
