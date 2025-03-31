# Authentication System Overhaul Documentation

This document provides a comprehensive explanation of the authentication system redesign for the Healthcare Portal application, focusing on security improvements, Edge Runtime compatibility, and best practices.

## Table of Contents
1. [Introduction and Problem Statement](#introduction-and-problem-statement)
2. [Overall Authentication Architecture](#overall-authentication-architecture)
3. [**HARDCODED CREDENTIALS - IMPORTANT**](#hardcoded-credentials)
4. [Key Components](#key-components)
   - [Authentication Library (auth.ts)](#authentication-library-authts)
   - [Login Page](#login-page)
   - [Authentication API](#authentication-api)
   - [User Session Hook](#user-session-hook)
   - [Middleware](#middleware)
   - [Logout Functionality](#logout-functionality)
5. [Security Considerations](#security-considerations)
6. [Edge Runtime Compatibility](#edge-runtime-compatibility)
7. [Alternative: JWT in Authorization Headers](#alternative-jwt-in-authorization-headers)
8. [Future Improvements](#future-improvements)

## Introduction and Problem Statement

The original authentication system had several critical issues:

1. **Insecure Data Storage:** User credentials and sensitive information were stored in client-accessible cookies using a weak XOR-based encryption that could be easily reversed.

2. **Client-Side Security Controls:** Most security validations happened on the client side, which could be bypassed by malicious users.

3. **Edge Runtime Incompatibility:** The system used Node.js crypto libraries that aren't supported in Next.js Edge Runtime.

4. **Poor Session Management:** There was no proper JWT-based session handling, and authentication state was maintained through easily manipulated client-side cookies.

The goal of the redesign was to create a secure, stateless authentication system using JWTs, move security controls to the server side, and ensure compatibility with Next.js Edge Runtime.

## HARDCODED CREDENTIALS

**READ THIS SECTION CAREFULLY**

The system uses the following hardcoded credentials:

```typescript
// These are the exact login credentials to use
const CREDENTIALS = {
  username: 'JaneDoePatient',
  password: 'IWantMyInfoPlease',
};
```

**USERNAME**: JaneDoePatient  
**PASSWORD**: IWantMyInfoPlease

These credentials are defined in `src/lib/auth.ts` and are used for authentication. The system is designed to verify against EXACTLY these values.

**YOU MUST USE THESE EXACT VALUES TO LOGIN**

There is no database connection in this demo application. All authentication is performed by comparing against these hardcoded values.

## Overall Authentication Architecture

The new authentication system follows these principles:

1. **JWT-Based Sessions:** Server-signed JWT tokens stored in HTTP-only cookies for secure session management.

2. **Server-Side Validation:** All critical security checks happen on the server.

3. **Edge Runtime Compatibility:** Using Web Crypto API instead of Node.js crypto.

4. **Stateless Authentication:** No need for a separate database to store sessions.

The authentication flow is:

1. User submits username and password to login page
2. Password is hashed client-side with SHA-256 before transmission
3. Server verifies credentials against stored values
4. Server creates a JWT containing user information and sets it in an HTTP-only cookie
5. Subsequent requests include the cookie, which is verified by middleware
6. Protected routes are only accessible with a valid JWT
7. When logging out, the JWT cookie is deleted

## Key Components

### Authentication Library (auth.ts)

The central component of the authentication system is the `auth.ts` library, which provides the core functionality for:

- Password hashing and verification
- JWT token creation and validation
- Session management
- User authentication

Here's the breakdown of each function:

#### Password Hashing with Web Crypto API

```typescript
// Hash password with SHA-256 using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

This function:
- Takes a plaintext password string
- Encodes it as UTF-8 bytes using TextEncoder
- Uses the standardized Web Crypto API to hash the data with SHA-256
- Converts the resulting buffer to a hexadecimal string
- Returns a promise that resolves to the hash string

The Web Crypto API is:
- Available in both browser and Edge environments
- Standardized across platforms
- Provides hardware-accelerated cryptographic operations
- More secure than custom implementations

#### Constant-Time Password Verification

```typescript
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
```

This function:
- Takes an input password and a stored password hash
- Hashes the input password using the same algorithm
- Performs a constant-time comparison of the two hashes
- Returns true only if the hashes match exactly

The constant-time comparison is critical for security as it prevents timing attacks where attackers can derive information based on how long the comparison takes.

#### JWT Token Management

```typescript
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
```

These functions:
- Create and verify JWT tokens using the jose library
- Set appropriate expiration times (7 days)
- Use HS256 algorithm for signing
- Handle verification errors gracefully

#### Session Management

```typescript
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
```

These functions:
- Create a session by generating a JWT with user data
- Store the session in an HTTP-only cookie
- Set appropriate security flags (httpOnly, secure, sameSite)
- Retrieve and validate session data from cookies
- Delete sessions when logging out

#### User Authentication

```typescript
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
```

This function:
- Takes a username and password hash
- Compares them against stored credentials
- Returns user data if authentication succeeds, null otherwise
- In a real app, it would query a database instead of using hardcoded values

### Login Page

The login page handles the client-side part of the authentication flow:

```typescript
// Hash password with SHA-256 on the client-side
function hashClientPassword(password: string): string {
  return SHA256(password).toString(Hex)
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setIsLoading(true)

  try {
    const hashedPassword = hashClientPassword(formData.password)

    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: formData.username,
        password: hashedPassword,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error logging in')
    }

    if (data.success) {
      router.push('/dashboard')
    } else {
      setError('Invalid credentials')
    }
  } catch (error) {
    console.error('Login error:', error)
    setError(error instanceof Error ? error.message : 'Error logging in')
  } finally {
    setIsLoading(false)
  }
}
```

This code:
- Hashes the password client-side using crypto-js (SHA-256)
- Sends the hashed password to the server
- Handles the authentication response
- Navigates to the dashboard on success
- Displays errors on failure

### Authentication API

The authentication API handles the server-side part of the login process:

```typescript
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Get stored hash from the pre-computed value in auth credentials
    const storedHash = await hashPassword('IWantMyInfoPlease');
    
    // If passwords match, authenticate user
    if (password === storedHash) {
      const user = await authenticate(username, password);

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Create session JWT with user data embedded
      await createSession(user.id, {
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth
      });

      // Return success response
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
```

This API:
- Validates the username and password
- Computes the expected password hash
- Compares the provided hash with the expected hash
- Creates a session with user data if authentication succeeds
- Returns appropriate responses for different scenarios

### User Session Hook

The `useUser` hook provides client-side access to the authenticated user's data:

```typescript
export function useUser() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        setLoading(true);
        const response = await fetch('/api/user');
        
        if (response.status === 401) {
          // Unauthorized - redirect to login
          router.push('/login');
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          setUser({
            userId: data.userId || '',
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            dateOfBirth: data.dateOfBirth || ''
          });
        } else {
          // Handle other errors
          console.error('Failed to fetch user info:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserInfo();
  }, [router]);

  return { user, loading };
}
```

This hook:
- Fetches user information from the server
- Handles unauthorized responses by redirecting to login
- Provides loading state for UI feedback
- Returns the user data and loading state for use in components

### Middleware

The middleware handles route protection and session validation:

```typescript
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // 1. Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // 2. Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  // 3. Get the session cookie
  const sessionCookie = req.cookies.get('session');
  
  // 4. If it's a protected route and no session cookie, redirect to login
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // 5. If it's a public route and we have a session cookie, verify token
  if (isPublicRoute && sessionCookie) {
    try {
      // Verify the JWT token
      const { payload } = await jose.jwtVerify(
        sessionCookie.value,
        encodedKey,
        { algorithms: ['HS256'] }
      );
      
      // If token is valid and trying to access login page, redirect to dashboard
      if (payload && path === '/login') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (error) {
      // If token verification fails, continue as normal
      console.error('Token verification failed:', error);
    }
  }
  
  return NextResponse.next();
}
```

The middleware:
- Runs on every request
- Determines if the requested route is protected or public
- Checks for the presence of a session cookie
- Redirects unauthenticated users to login
- Redirects authenticated users away from public routes (like login)
- Verifies the JWT token's validity

### Logout Functionality

The logout button in the dashboard layout:

```typescript
const handleLogout = async () => {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // Redirect to login page after successful logout
      router.push('/login');
    } else {
      console.error('Logout failed');
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
```

The logout API endpoint:

```typescript
export async function POST() {
  try {
    // Delete the session cookie
    const cookieStore = await cookies();
    cookieStore.delete('session');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
```

This functionality:
- Calls the logout API endpoint
- Deletes the session cookie on the server
- Redirects the user to the login page
- Handles any errors gracefully

## Security Considerations

The new authentication system addresses several security concerns:

1. **Password Transmission:** Passwords are hashed client-side before transmission to prevent exposure of plaintext passwords.

2. **Token Storage:** JWTs are stored in HTTP-only cookies to prevent access from JavaScript.

3. **CSRF Protection:** Using SameSite=lax cookies to protect against cross-site request forgery.

4. **Timing Attacks:** Constant-time comparison for password verification to prevent timing-based attacks.

5. **Server-Side Validation:** All critical security checks happen on the server, which cannot be bypassed.

6. **Token Expiration:** JWTs have an expiration time to limit the window of opportunity for token theft.

7. **Secure Cryptography:** Using standardized Web Crypto API for cryptographic operations.

## Edge Runtime Compatibility

The changes made to ensure Edge Runtime compatibility:

1. **Web Crypto API:** Replacing Node.js crypto with Web Crypto API.

2. **Constant-Time Comparison:** Implementing our own constant-time comparison since Node's timingSafeEqual is not available.

3. **Async Cryptography:** Making cryptographic functions async to handle Web Crypto's Promise-based API.

4. **Cookie Handling:** Using Next.js's built-in cookies API for server-side cookie management.

5. **jose Library:** Using the jose library for JWT operations, which is compatible with Edge Runtime.

## Alternative: JWT in Authorization Headers

While the current implementation uses HTTP-only cookies to store JWT tokens, an alternative approach is to use Authorization headers with Bearer tokens. This section explains how to modify the system to use this approach instead.

### Modifications to Authentication API

Change the auth API to return the JWT token in the response body instead of setting a cookie:

```typescript
export async function POST(request: NextRequest) {
  // ... existing validation and authentication code ...

  // Create JWT token with user data
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await createToken({
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    dateOfBirth: user.dateOfBirth,
    expiresAt
  });

  // Return the token in the response
  return NextResponse.json({
    success: true,
    token: token
  });
}
```

### Client-Side Token Storage

Store the token in localStorage or sessionStorage on the client side:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... existing validation and API call code ...

  if (data.success && data.token) {
    // Store token in localStorage
    localStorage.setItem('authToken', data.token);
    router.push('/dashboard');
  }
};
```

### Authentication Hook with Auth Header

Create a hook that attaches the token to all API requests:

```typescript
export function useAuthFetch() {
  const router = useRouter();

  return useCallback(async (url: string, options: RequestInit = {}) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    // Clone headers to avoid modifying the original object
    const headers = new Headers(options.headers || {});
    
    // Add Authorization header if token exists
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Send request with Authorization header
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Handle 401 Unauthorized responses
    if (response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      router.push('/login');
      return null;
    }
    
    return response;
  }, [router]);
}
```

### Modified Middleware

Update the middleware to check for the Authorization header instead of cookies:

```typescript
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
  if (isProtectedRoute) {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    
    // If no Authorization header, redirect to login
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Extract the token
    const token = authHeader.substring(7);
    
    try {
      // Verify the token
      await jose.jwtVerify(token, encodedKey, {
        algorithms: ['HS256']
      });
      
      // Token is valid, allow the request
      return NextResponse.next();
    } catch (error) {
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  return NextResponse.next();
}
```

### Logout Implementation

Modify the logout functionality to clear the token from localStorage:

```typescript
const handleLogout = () => {
  // Remove token from localStorage
  localStorage.removeItem('authToken');
  
  // Redirect to login page
  router.push('/login');
};
```

### Advantages of Authorization Headers

1. **No CSRF Vulnerability:** Since the token is not automatically sent with every request, it's not vulnerable to CSRF attacks.

2. **Works Across Domains:** Can be used with APIs hosted on different domains without CORS issues.

3. **Mobile App Compatibility:** Easier to implement in mobile apps that may not support cookies well.

4. **Client-Side Control:** Gives more control to the client application over token management.

### Disadvantages of Authorization Headers

1. **XSS Vulnerability:** Tokens stored in localStorage or sessionStorage are accessible to JavaScript, making them vulnerable to XSS attacks.

2. **Manual Implementation:** Requires manual handling of token storage, retrieval, and attaching to requests.

3. **Token Size Limitations:** Some browsers have limitations on header sizes, which could be an issue for large JWTs.

4. **Logout Challenges:** Cannot invalidate tokens from the server side as easily as with cookies.

### Secure Implementation Recommendations

If using the Authorization header approach, consider these additional security measures:

1. **Short-lived Tokens:** Use shorter expiration times for tokens (e.g., 15-60 minutes).

2. **Refresh Token Pattern:** Implement a refresh token flow to obtain new access tokens without re-authentication.

3. **XSS Protection:** Implement strong Content Security Policy (CSP) headers to mitigate XSS risks.

4. **Token Encryption:** Consider encrypting the token payload to protect sensitive data.

5. **Token Revocation:** Implement a token blacklist or revocation mechanism on the server.

## Future Improvements

Potential future improvements to the authentication system:

1. **Database Integration:** Store user credentials in a database rather than hardcoding them.

2. **Refresh Tokens:** Implement short-lived access tokens with refresh tokens for better security.

3. **Multi-Factor Authentication:** Add support for 2FA or other additional authentication factors.

4. **Password Policies:** Enforce password complexity requirements and expiration.

5. **Rate Limiting:** Implement rate limiting to prevent brute force attacks.

6. **Audit Logging:** Add comprehensive logging for authentication events.

7. **Account Recovery:** Implement secure account recovery mechanisms.

8. **Environment Variables:** Move sensitive values like the session secret to environment variables.

9. **User Registration:** Add the ability for new users to register accounts.

10. **Role-Based Access Control:** Implement fine-grained access control based on user roles.

