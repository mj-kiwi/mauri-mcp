import { z } from "zod";

export const ApiKeyAuthConfigSchema = z.object({
  type: z.literal("apiKey"),
  apiKey: z.string(),
});

export const JwtAuthConfigSchema = z.object({
  type: z.literal("jwt"),
  secret: z.string(),
  issuer: z.string().optional(),
  audience: z.string().optional(),
  expiresIn: z.string().optional(),
});

export const AuthConfigSchema = z.discriminatedUnion("type", [
  ApiKeyAuthConfigSchema,
  JwtAuthConfigSchema,
]);

export type ApiKeyAuthConfig = z.infer<typeof ApiKeyAuthConfigSchema>;
export type JwtAuthConfig = z.infer<typeof JwtAuthConfigSchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export interface AuthResult {
  isValid: boolean;
  error?: string;
  payload?: any;
} 