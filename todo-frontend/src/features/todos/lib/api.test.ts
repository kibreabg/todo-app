import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mswServer";
import { createTodo, listTodos } from "@/features/todos/lib/api";

describe("todos api", () => {
  it("retries listTodos after refresh when first request is unauthorized", async () => {
    let todoListCalls = 0;

    server.use(
      http.get("/api/todos", () => {
        todoListCalls += 1;

        if (todoListCalls === 1) {
          return new HttpResponse(null, { status: 401 });
        }

        return HttpResponse.json([
          {
            id: "t1",
            title: "Write tests",
            completed: false,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        ]);
      }),
      http.post("/api/auth/refresh", () => new HttpResponse(null, { status: 200 })),
    );

    const todos = await listTodos();

    expect(todos).toHaveLength(1);
    expect(todos[0]?.title).toBe("Write tests");
    expect(todoListCalls).toBe(2);
  });

  it("throws API message for createTodo failures", async () => {
    server.use(
      http.post("/api/todos", () =>
        HttpResponse.json({ error: "Title is required." }, { status: 400 }),
      ),
    );

    await expect(
      createTodo({
        title: "",
        completed: false,
      }),
    ).rejects.toThrow("Title is required.");
  });
});
