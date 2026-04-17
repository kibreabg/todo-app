import type { Todo, UpsertTodoPayload } from "./types";

async function requestWithAuthRetry(
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<Response> {
  const firstResponse = await fetch(input, {
    ...init,
    credentials: "include",
  });

  if (firstResponse.status !== 401) {
    return firstResponse;
  }

  const refreshResponse = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  if (!refreshResponse.ok) {
    return firstResponse;
  }

  return fetch(input, {
    ...init,
    credentials: "include",
  });
}

async function parseResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");

  if (!isJson) {
    if (!response.ok) {
      throw new Error("Unexpected server response.");
    }

    return undefined as T;
  }

  const data = (await response.json()) as T;

  if (!response.ok) {
    const maybeError = data as { error?: string };
    throw new Error(maybeError.error ?? "Request failed.");
  }

  return data;
}

export async function listTodos(): Promise<Todo[]> {
  const response = await requestWithAuthRetry("/api/todos", {
    method: "GET",
    cache: "no-store",
  });

  return parseResponse<Todo[]>(response);
}

export async function createTodo(payload: UpsertTodoPayload): Promise<Todo> {
  const response = await requestWithAuthRetry("/api/todos", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<Todo>(response);
}

export async function updateTodo(
  id: string,
  payload: UpsertTodoPayload,
): Promise<Todo> {
  const response = await requestWithAuthRetry(`/api/todos/${id}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<Todo>(response);
}

export async function deleteTodo(id: string): Promise<void> {
  const response = await requestWithAuthRetry(`/api/todos/${id}`, {
    method: "DELETE",
  });

  await parseResponse<void>(response);
}
