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

    return toNextResponse(response);
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to backend API." },
      { status: 502 },
    );
  }
}
