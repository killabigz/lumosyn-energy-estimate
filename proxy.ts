import { NextResponse, type NextRequest } from "next/server";
import {
  getConfiguredHqCredentials,
  isValidHqBasicAuthorization,
} from "@/lib/hq/basicAuth";

const HQ_REALM = "Lumosyn HQ";

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
  if (!getConfiguredHqCredentials()) {
    return unauthorizedResponse("Lumosyn HQ is not configured.");
  }

  if (!isValidHqBasicAuthorization(request.headers.get("authorization"))) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/hq", "/hq/:path*"],
};
