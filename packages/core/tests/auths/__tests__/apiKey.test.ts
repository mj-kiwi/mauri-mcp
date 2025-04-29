import { describe, it, expect } from "vitest";
import { ApiKeyAuth } from "../../../src/auths/apiKey.js";

describe("ApiKeyAuth", () => {
  const config = {
    type: "apiKey" as const,
    apiKey: "test-api-key",
  };

  const auth = new ApiKeyAuth(config);

  it("should validate correct API key", async () => {
    const result = await auth.validate("test-api-key");
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should reject incorrect API key", async () => {
    const result = await auth.validate("wrong-api-key");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Invalid API key");
  });

  it("should reject empty token", async () => {
    const result = await auth.validate("");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("API key is required");
  });
});
