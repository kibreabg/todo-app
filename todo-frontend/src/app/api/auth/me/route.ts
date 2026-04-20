import { NextResponse } from "next/server";
import {
  buildProxyHeaders,
  getBackendBaseUrl,
  toNextResponse,
} from "@/app/api/_lib/backendProxy";

export async function GET(request: Request) {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/auth/me`, {
      method: "GET",
      headers: buildProxyHeaders(request),
      cache: "no-store",
    });

    const isExpectedUnauthorized = request.headers.get("x-expected-401") === "1";
    if (isExpectedUnauthorized && response.status === 401) {
      const suppressed = new NextResponse(null, { status: 204 });
      const anyHeaders = response.headers as unknown as {
        getSetCookie?: () => string[];
      };
      const setCookies = anyHeaders.getSetCookie?.() ?? [];

      if (setCookies.length > 0) {
        for (const cookie of setCookies) {
          suppressed.headers.append("set-cookie", cookie);
        }
      } else {
        const combinedSetCookie = response.headers.get("set-cookie");
        if (combinedSetCookie) {
          suppressed.headers.append("set-cookie", combinedSetCookie);
        }
      }

      return suppressed;
    }

    return toNextResponse(response);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to backend API." },
      { status: 502 },
    );
  }
}
