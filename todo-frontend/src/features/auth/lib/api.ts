import type { AuthUser, LoginPayload, RegisterPayload } from "./types";

class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");

  if (!isJson) {
    if (!response.ok) {
      throw new ApiError("Unexpected server response.", response.status);
    }

    return undefined as T;
  }

  const data = (await response.json()) as T;

  if (!response.ok) {
    const maybeError = data as { error?: string };
    throw new ApiError(maybeError.error ?? "Request failed.", response.status);
  }

  return data;
}

export async function refreshSession(): Promise<boolean> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  return response.ok;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });

  if (response.status === 401) {
    const refreshed = await refreshSession();
    if (!refreshed) {
      return null;
    }

    const retried = await fetch("/api/auth/me", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    });

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
