import { describe, it, expect } from "vitest";
import { AuthFactory } from "../../../src/auths/factory.js";
import { ApiKeyAuth } from "../../../src/auths/apiKey.js";
import { JwtAuth } from "../../../src/auths/jwt.js";

describe("AuthFactory", () => {
  it("should create ApiKeyAuth instance", () => {
    const config = {
      type: "apiKey" as const,
      apiKey: "test-api-key",
    };

    const auth = AuthFactory.create(config);
    expect(auth).toBeInstanceOf(ApiKeyAuth);
  });

  it("should create JwtAuth instance", () => {
    const config = {
      type: "jwt" as const,
      secret: "test-secret",
      issuer: "test-issuer",
      audience: "test-audience",
      expiresIn: "1h",
    };

    const auth = AuthFactory.create(config);
    expect(auth).toBeInstanceOf(JwtAuth);
  });

  it("should throw error for unsupported auth type", () => {
    const config = {
      type: "unsupported" as any,
    };

    expect(() => AuthFactory.create(config as any)).toThrow(
      "Unsupported authentication type:"
    );
  });
});
