import {
  buildProxyHeaders,
  getBackendBaseUrl,
  toProxyConnectionErrorResponse,
  toNextResponse,
} from "@/app/api/_lib/backendProxy";

export async function POST(request: Request) {
  const targetUrl = `${getBackendBaseUrl()}/api/auth/login`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: buildProxyHeaders(request, true),
      body: await request.text(),
      cache: "no-store",
    });

    return toNextResponse(response);
  } catch (error) {
    return toProxyConnectionErrorResponse(targetUrl, error);
  }
}
