import { SignJWT, jwtVerify } from 'jose';
import { timingSafeEqual, scryptSync, randomBytes } from 'crypto';
import { NextRequest } from 'next/server';

const JWT_SECRET = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return new TextEncoder().encode(secret);
};

const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, keylen: 64 };

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, SCRYPT_OPTIONS.keylen, {
    N: SCRYPT_OPTIONS.N,
    r: SCRYPT_OPTIONS.r,
    p: SCRYPT_OPTIONS.p,
  }).toString('hex');
  return `scrypt$${SCRYPT_OPTIONS.N}$${SCRYPT_OPTIONS.r}$${SCRYPT_OPTIONS.p}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [, N, r, p, salt, hash] = storedHash.split('$');
  const derived = scryptSync(password, salt, SCRYPT_OPTIONS.keylen, {
    N: parseInt(N),
    r: parseInt(r),
    p: parseInt(p),
  });
  const expected = Buffer.from(hash, 'hex');
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

export async function createToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function getAuthUser(request: NextRequest): Promise<JwtPayload | null> {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function generateUserId(): string {
  return `u_${Date.now().toString(36)}_${randomBytes(4).toString('hex')}`;
}
