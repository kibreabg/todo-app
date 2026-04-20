import { NextResponse } from "next/server";
import {
  buildProxyHeaders,
  getBackendBaseUrl,
  toProxyConnectionErrorResponse,
  toNextResponse,
} from "@/app/api/_lib/backendProxy";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const targetUrl = `${getBackendBaseUrl()}/api/todos/${id}`;

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
      method: "PUT",
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

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const targetUrl = `${getBackendBaseUrl()}/api/todos/${id}`;

  try {
    const response = await fetch(targetUrl, {
      method: "DELETE",
      headers: buildProxyHeaders(request, false),
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return toNextResponse(response);
  } catch (error) {
    return toProxyConnectionErrorResponse(targetUrl, error);
  }
}
