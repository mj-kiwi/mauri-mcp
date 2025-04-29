import { AuthResult } from './types.js';

export interface ApiKeyAuthConfig {
  type: 'apiKey';
  apiKey: string;
}

export class ApiKeyAuth {
  private apiKey: string;

  constructor(config: ApiKeyAuthConfig) {
    this.apiKey = config.apiKey;
  }

  async validate(token: string): Promise<AuthResult> {
    if (!token) {
      return {
        isValid: false,
        error: 'API key is required'
      };
    }

    if (token !== this.apiKey) {
      return {
        isValid: false,
        error: 'Invalid API key'
      };
    }

    return {
      isValid: true
    };
  }
} 