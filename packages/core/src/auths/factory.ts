import { AuthConfig } from "./types.js";
import { ApiKeyAuth } from "./apiKey.js";
import { JwtAuth } from "./jwt.js";

export class AuthFactory {
  static create(config: AuthConfig) {
    switch (config.type) {
      case "apiKey":
        return new ApiKeyAuth(config);
      case "jwt":
        return new JwtAuth(config);
      default:
        throw new Error(`Unsupported authentication type: ${config.type}`);
    }
  }
} 