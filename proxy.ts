import { NextResponse, type NextRequest } from "next/server";

type BasicCredentials = {
  password: string;
  username: string;
};

const HQ_REALM = "Lumosyn HQ";

function getConfiguredCredentials(): BasicCredentials | null {
  const username = process.env.HQ_BASIC_AUTH_USER?.trim();
  const password = process.env.HQ_BASIC_AUTH_PASSWORD?.trim();

  if (!username || !password) {
    return null;
  }

  return {
    password,
    username,
  };
}

function parseBasicAuthorization(value: string | null): BasicCredentials | null {
  if (!value) {
    return null;
  }

  const [scheme, encodedCredentials] = value.split(" ");

  if (scheme !== "Basic" || !encodedCredentials) {
    return null;
  }

  try {
    const decodedCredentials = atob(encodedCredentials);
    const separatorIndex = decodedCredentials.indexOf(":");

    if (separatorIndex < 0) {
      return null;
    }

    return {
      password: decodedCredentials.slice(separatorIndex + 1),
      username: decodedCredentials.slice(0, separatorIndex),
    };
  } catch {
    return null;
  }
}

function unauthorizedResponse(message = "Authentication required.") {
  return new NextResponse(message, {
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": `Basic realm="${HQ_REALM}", charset="UTF-8"`,
    },
    status: 401,
  });
}

export function proxy(request: NextRequest) {
  const configuredCredentials = getConfiguredCredentials();

  if (!configuredCredentials) {
    return unauthorizedResponse("Lumosyn HQ is not configured.");
  }

  const providedCredentials = parseBasicAuthorization(
    request.headers.get("authorization"),
  );

  if (
    !providedCredentials ||
    providedCredentials.username !== configuredCredentials.username ||
    providedCredentials.password !== configuredCredentials.password
  ) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/hq", "/hq/:path*"],
};
