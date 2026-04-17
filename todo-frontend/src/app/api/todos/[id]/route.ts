import { NextResponse } from "next/server";
import {
  buildProxyHeaders,
  getBackendBaseUrl,
  toNextResponse,
} from "@/app/api/_lib/backendProxy";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

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
    const response = await fetch(`${getBackendBaseUrl()}/api/todos/${id}`, {
      method: "PUT",
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

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/todos/${id}`, {
      method: "DELETE",
      headers: buildProxyHeaders(request, false),
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return toNextResponse(response);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to backend API." },
      { status: 502 },
    );
  }
}
