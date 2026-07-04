const MAX_TRACKING_VALUE_LENGTH = 100;
const MAX_LOCATION_VALUE_LENGTH = 300;
const DEFAULT_SOURCE = "direct";

const UTM_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const TRACKING_SOURCE_PARAM_KEYS = [...UTM_PARAM_KEYS, "source"] as const;

export const TRACKING_URL_PARAM_KEYS = [
  ...TRACKING_SOURCE_PARAM_KEYS,
  "landing_page",
] as const;

type TrackingSourceParamKey = (typeof TRACKING_SOURCE_PARAM_KEYS)[number];
type TrackingUrlParamKey = (typeof TRACKING_URL_PARAM_KEYS)[number];
type SearchParamSource =
  | URLSearchParams
  | Record<string, unknown>
  | null
  | undefined;

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export type TrackingContext = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  source: string;
  landing_page: string | null;
  referrer: string | null;
};

const lowercaseParamKeys = new Set<TrackingSourceParamKey>([
  "utm_source",
  "utm_medium",
  "source",
]);

function readParam(input: SearchParamSource, key: TrackingUrlParamKey | "referrer") {
  if (!input) {
    return null;
  }

  if (input instanceof URLSearchParams) {
    return input.get(key);
  }

  const value = input[key];

  if (Array.isArray(value)) {
    const firstTextValue = value.find((item) => typeof item === "string");

    return typeof firstTextValue === "string" ? firstTextValue : null;
  }

  return typeof value === "string" ? value : null;
}

export function sanitizeTrackingValue(
  value: unknown,
  key: TrackingSourceParamKey,
) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .slice(0, MAX_TRACKING_VALUE_LENGTH);

  if (!cleaned) {
    return null;
  }

  return lowercaseParamKeys.has(key) ? cleaned.toLowerCase() : cleaned;
}

function sanitizeLocationValue(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .trim()
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .slice(0, MAX_LOCATION_VALUE_LENGTH);

  return cleaned || null;
}

function sanitizeLandingPageValue(value: unknown) {
  const cleaned = sanitizeLocationValue(value);

  if (!cleaned || !cleaned.startsWith("/") || cleaned.startsWith("//")) {
    return null;
  }

  return cleaned;
}

export function sanitizeReferrerValue(value: unknown) {
  return sanitizeLocationValue(value);
}

export function getSafeTrackingQueryParams(input: SearchParamSource) {
  const safeParams: Partial<Record<TrackingSourceParamKey, string>> = {};

  for (const key of TRACKING_SOURCE_PARAM_KEYS) {
    const value = sanitizeTrackingValue(readParam(input, key), key);

    if (value) {
      safeParams[key] = value;
    }
  }

  return safeParams;
}

export function getLandingPageFromSearchParams(input: SearchParamSource) {
  return sanitizeLandingPageValue(readParam(input, "landing_page"));
}

export function buildLandingPagePath(
  pathname: string,
  input: SearchParamSource,
) {
  const safePathname = sanitizeLandingPageValue(pathname) ?? "/";
  const safeParams = getSafeTrackingQueryParams(input);
  const query = new URLSearchParams();

  for (const key of TRACKING_SOURCE_PARAM_KEYS) {
    const value = safeParams[key];

    if (value) {
      query.set(key, value);
    }
  }

  const queryString = query.toString();

  return queryString ? `${safePathname}?${queryString}` : safePathname;
}

export function buildEstimateHrefFromSearchParams(
  input: SearchParamSource,
  landingPathname: string,
) {
  const safeParams = getSafeTrackingQueryParams(input);
  const query = new URLSearchParams();

  for (const key of TRACKING_SOURCE_PARAM_KEYS) {
    const value = safeParams[key];

    if (value) {
      query.set(key, value);
    }
  }

  query.set("landing_page", buildLandingPagePath(landingPathname, input));

  return `/estimate?${query.toString()}`;
}

export function parseTrackingSearchParams(
  input: SearchParamSource,
): TrackingContext {
  const safeParams = getSafeTrackingQueryParams(input);
  const utmSource = safeParams.utm_source ?? null;

  return {
    utm_source: utmSource,
    utm_medium: safeParams.utm_medium ?? null,
    utm_campaign: safeParams.utm_campaign ?? null,
    utm_content: safeParams.utm_content ?? null,
    utm_term: safeParams.utm_term ?? null,
    source: utmSource ?? safeParams.source ?? DEFAULT_SOURCE,
    landing_page: getLandingPageFromSearchParams(input),
    referrer: null,
  };
}

export function parseTrackingPayload(input: SearchParamSource) {
  const trackingContext = parseTrackingSearchParams(input);

  return {
    ...trackingContext,
    referrer: sanitizeReferrerValue(readParam(input, "referrer")),
  };
}
