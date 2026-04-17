import { NextResponse } from "next/server";

const DEFAULT_BACKEND_BASE_URL = "http://localhost:5284";

function getBackendBaseUrl() {
  return (
    process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? DEFAULT_BACKEND_BASE_URL
  );
}

async function toNextResponse(response: Response): Promise<NextResponse> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  }

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "content-type": contentType || "text/plain",
    },
  });
}

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
      headers: {
        "content-type": "application/json",
      },
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

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/todos/${id}`, {
      method: "DELETE",
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
