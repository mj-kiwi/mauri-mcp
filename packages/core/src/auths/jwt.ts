import { JwtAuthConfig, AuthResult } from "./types.js";
import { jwtVerify } from "jose";

export class JwtAuth {
  private config: JwtAuthConfig;

  constructor(config: JwtAuthConfig) {
    this.config = config;
  }

  async validate(token: string): Promise<AuthResult> {
    if (!token) {
      return {
        isValid: false,
        error: "JWT token is required",
      };
    }

    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(this.config.secret),
        {
          issuer: this.config.issuer,
          audience: this.config.audience,
        }
      );

      return {
        isValid: true,
        payload,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("exp")) {
        return {
          isValid: false,
          error: "Token expired",
        };
      }
      return {
        isValid: false,
        error: "Invalid token",
      };
    }
  }
}
