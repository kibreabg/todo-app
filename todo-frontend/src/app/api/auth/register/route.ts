import { NextResponse } from "next/server";
import {
  buildProxyHeaders,
  getBackendBaseUrl,
  toNextResponse,
} from "@/app/api/_lib/backendProxy";

export async function POST(request: Request) {
  try {
    const response = await fetch(`${getBackendBaseUrl()}/api/auth/register`, {
      method: "POST",
      headers: buildProxyHeaders(request, true),
      body: await request.text(),
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
