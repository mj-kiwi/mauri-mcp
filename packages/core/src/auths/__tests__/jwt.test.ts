import { describe, it, expect } from 'vitest';
import { JwtAuth } from '../jwt.js';
import { SignJWT } from 'jose/jwt/sign';

describe('JwtAuth', () => {
  const config = {
    type: 'jwt' as const,
    secret: 'test-secret',
    issuer: 'test-issuer',
    audience: 'test-audience',
    expiresIn: '1h'
  };

  const auth = new JwtAuth(config);

  it('should validate valid JWT token', async () => {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(config.issuer)
      .setAudience(config.audience)
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(config.secret));

    const result = await auth.validate(token);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject invalid JWT token', async () => {
    const result = await auth.validate('invalid-token');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid token');
  });

  it('should reject expired JWT token', async () => {
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(config.issuer)
      .setAudience(config.audience)
      .setExpirationTime('0s')
      .sign(new TextEncoder().encode(config.secret));

    const result = await auth.validate(token);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Token expired');
  });
}); 