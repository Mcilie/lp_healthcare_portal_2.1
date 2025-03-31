import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

// Define session payload type
type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

// These should be environment variables in a real app
const SESSION_SECRET = 'your-super-secure-secret-key-min-32-chars-long';
const encodedKey = new TextEncoder().encode(SESSION_SECRET);

// Hardcoded credentials - in a real app, these would be stored securely
const CREDENTIALS = {
  username: 'JaneDoePatient',
  password: 'IWantMyInfoPlease',
};

// Hash password with SHA-256 using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password using constant-time comparison to prevent timing attacks
export async function verifyPassword(inputPassword: string, storedPasswordHash: string): Promise<boolean> {
  const inputHash = await hashPassword(inputPassword);
  
  // Constant-time comparison
  if (inputHash.length !== storedPasswordHash.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < inputHash.length; i++) {
    result |= inputHash.charCodeAt(i) ^ storedPasswordHash.charCodeAt(i);
  }
  
  return result === 0;
}

// Create JWT token
export async function createToken(payload: any): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

// Verify JWT token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('Failed to verify token:', error);
    return null;
  }
}

// Create session and set cookie
export async function createSession(userId: string, userData: any = {}) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await createToken({ userId, expiresAt, ...userData });
  
  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
  
  return session;
}

// Get session from cookie
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  
  const payload = await verifyToken(session);
  return payload;
}

// Delete session
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Authenticate user with username and password
export async function authenticate(username: string, passwordHash: string) {
  // In a real app, we would fetch the user from a database
  // Here we precompute the hash of the hardcoded password for comparison
  const storedPasswordHash = await hashPassword(CREDENTIALS.password);
  
  if (username === CREDENTIALS.username && passwordHash === storedPasswordHash) {
    return { 
      id: '5',
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '1992-03-15'
    };
  }
  return null;
} 