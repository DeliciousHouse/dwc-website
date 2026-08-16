import { describe, expect, it } from "vitest";
import { getToken } from "next-auth/jwt";

describe("next-auth token handling", () => {
  it("rejects malformed percent-encoded Bearer tokens", async () => {
    const req = {
      headers: new Headers({ authorization: "Bearer %" }),
    };

    await expect(getToken({ req, secret: "test-secret" })).resolves.toBeNull();
  });
});
