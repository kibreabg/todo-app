import { NextResponse } from "next/server";
import {
  buildProxyHeaders,
  getBackendBaseUrl,
  toNextResponse,
} from "@/app/api/_lib/backendProxy";

export async function GET(request: Request) {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/todos`, {
      method: "GET",
      headers: buildProxyHeaders(request),
      cache: "no-store",
    });

    return toNextResponse(response);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to backend API." },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
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
    const response = await fetch(`${getBackendBaseUrl()}/api/todos`, {
      method: "POST",
      headers: buildProxyHeaders(request, true),
      body: JSON.stringify({
        title: payload.title.trim(),
        completed: Boolean(payload.completed),
      }),
    });

    return toNextResponse(response);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to backend API." },
      { status: 502 },
    );
  }
}
