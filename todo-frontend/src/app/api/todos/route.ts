import { NextResponse } from "next/server";
import {
  buildProxyHeaders,
  getBackendBaseUrl,
  toProxyConnectionErrorResponse,
  toNextResponse,
} from "@/app/api/_lib/backendProxy";

export async function GET(request: Request) {
  const targetUrl = `${getBackendBaseUrl()}/api/todos`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: buildProxyHeaders(request),
      cache: "no-store",
    });

    return toNextResponse(response);
  } catch (error) {
    return toProxyConnectionErrorResponse(targetUrl, error);
  }
}

export async function POST(request: Request) {
  const targetUrl = `${getBackendBaseUrl()}/api/todos`;

  const payload = (await request.json()) as {
    title?: unknown;
    completed?: unknown;
  };

  if (typeof payload.title !== "string" || !payload.title.trim()) {
    return NextResponse.json(
      { error: "Title is required." },
      {
        status: 400,
      },
    );
  }

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: buildProxyHeaders(request, true),
      body: JSON.stringify({
        title: payload.title.trim(),
        completed: Boolean(payload.completed),
      }),
    });

    return toNextResponse(response);
  } catch (error) {
    return toProxyConnectionErrorResponse(targetUrl, error);
  }
}
