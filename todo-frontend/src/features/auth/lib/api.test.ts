import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/mswServer";
import { getCurrentUser } from "@/features/auth/lib/api";

describe("auth api", () => {
  it("returns null when current user is unauthorized and refresh fails", async () => {
    server.use(
      http.get("/api/auth/me", () => new HttpResponse(null, { status: 401 })),
      http.post("/api/auth/refresh", () => new HttpResponse(null, { status: 401 })),
    );

    const user = await getCurrentUser();

    expect(user).toBeNull();
  });

  it("retries getCurrentUser after successful refresh", async () => {
    let meCalls = 0;

    server.use(
      http.get("/api/auth/me", () => {
        meCalls += 1;

        if (meCalls === 1) {
          return new HttpResponse(null, { status: 401 });
        }

        return HttpResponse.json({
          userId: "u1",
          email: "dev@example.com",
          userName: "dev",
          expiresAtUtc: "2026-01-01T00:00:00.000Z",
        });
      }),
      http.post("/api/auth/refresh", () => new HttpResponse(null, { status: 200 })),
    );

    const user = await getCurrentUser();

    expect(user?.email).toBe("dev@example.com");
    expect(meCalls).toBe(2);
  });
});
