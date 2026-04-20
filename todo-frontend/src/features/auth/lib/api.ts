import type { AuthUser, LoginPayload, RegisterPayload } from "./types";

class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function extractMessageFromStringPayload(payload: string): string | null {
  const message = payload.trim();
  if (message.length === 0) {
    return null;
  }

  // Some endpoints return RFC 7807 payloads as text/plain.
  // Try to parse JSON text and extract a friendly error message.
  try {
    const parsed = JSON.parse(message) as unknown;
    return extractErrorMessage(parsed) ?? message;
  } catch {
    return message;
  }
}

function extractErrorMessage(payload: unknown): string | null {
  if (typeof payload === "string") {
    return extractMessageFromStringPayload(payload);
  }

  const listPayload = toStringArray(payload);
  if (listPayload.length > 0) {
    return listPayload.join(" ");
  }

  if (!isRecord(payload)) {
    return null;
  }

  const directMessageCandidates = [
    payload.error,
    payload.message,
    payload.detail,
    payload.title,
  ];

  for (const candidate of directMessageCandidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  const errorList = toStringArray(payload.errors);
  if (errorList.length > 0) {
    return errorList.join(" ");
  }

  if (isRecord(payload.errors)) {
    const validationMessages = Object.values(payload.errors)
      .flatMap((value) => toStringArray(value))
      .filter((value) => value.trim().length > 0);

    if (validationMessages.length > 0) {
      return validationMessages.join(" ");
    }
  }

  return null;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");

  if (isJson) {
    const data = (await response.json()) as unknown;

    if (!response.ok) {
      throw new ApiError(
        extractErrorMessage(data) ?? `Request failed with status ${response.status}.`,
        response.status,
      );
    }

    return data as T;
  }

  const text = await response.text();

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(text) ?? `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  return undefined as T;
}

export async function refreshSession(): Promise<boolean> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    headers: {
      "x-expected-401": "1",
    },
  });

  if (response.status === 204) {
    return false;
  }

  return response.ok;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
    headers: {
      "x-expected-401": "1",
    },
  });

  if (response.status === 204) {
    return null;
  }

  if (response.status === 401) {
    const refreshed = await refreshSession();
    if (!refreshed) {
      return null;
    }

    const retried = await fetch("/api/auth/me", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
      headers: {
        "x-expected-401": "1",
      },
    });

    if (retried.status === 204) {
      return null;
    }

    if (retried.status === 401) {
      return null;
    }

    return parseResponse<AuthUser>(retried);
  }

  return parseResponse<AuthUser>(response);
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<AuthUser>(response);
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<AuthUser>(response);
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  await parseResponse<void>(response);
}

export { ApiError };
