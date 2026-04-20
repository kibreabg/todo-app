import { NextResponse } from "next/server";
import {
  buildProxyHeaders,
  getBackendBaseUrl,
  toProxyConnectionErrorResponse,
  toNextResponse,
} from "@/app/api/_lib/backendProxy";

export async function POST(request: Request) {
  const targetUrl = `${getBackendBaseUrl()}/api/auth/refresh`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
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
  } catch (error) {
    return toProxyConnectionErrorResponse(targetUrl, error);
  }
}
