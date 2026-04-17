import { NextResponse } from "next/server";

const DEFAULT_BACKEND_BASE_URL = "http://localhost:5284";

export function getBackendBaseUrl() {
  return (
    process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? DEFAULT_BACKEND_BASE_URL
  );
}

export function buildProxyHeaders(request: Request, includeJsonContentType = false) {
  const headers = new Headers();
  const cookie = request.headers.get("cookie");

  if (cookie) {
    headers.set("cookie", cookie);
  }

  if (includeJsonContentType) {
    headers.set("content-type", "application/json");
  }

  return headers;
}

export async function toNextResponse(response: Response): Promise<NextResponse> {
  const contentType = response.headers.get("content-type") ?? "";

  const nextResponse = contentType.includes("application/json")
    ? NextResponse.json(await response.json(), { status: response.status })
    : new NextResponse(await response.text(), {
        status: response.status,
        headers: {
          "content-type": contentType || "text/plain",
        },
      });

  const anyHeaders = response.headers as unknown as {
    getSetCookie?: () => string[];
  };
  const setCookies = anyHeaders.getSetCookie?.() ?? [];

  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      nextResponse.headers.append("set-cookie", cookie);
    }
  } else {
    const combinedSetCookie = response.headers.get("set-cookie");
    if (combinedSetCookie) {
      nextResponse.headers.append("set-cookie", combinedSetCookie);
    }
  }

  return nextResponse;
}
