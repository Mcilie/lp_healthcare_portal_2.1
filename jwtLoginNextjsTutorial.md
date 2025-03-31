# Authentication

Understanding authentication is crucial for protecting your application's data. This page will guide you through what React and Next.js features to use to implement auth.

Before starting, it helps to break down the process into three concepts:

1. **[Authentication](https://nextjs.org/docs/app/building-your-application/authentication#authentication)**: Verifies if the user is who they say they are. It requires the user to prove their identity with something they have, such as a username and password.
2. **[Session Management](https://nextjs.org/docs/app/building-your-application/authentication#session-management)**: Tracks the user's auth state across requests.
3. **[Authorization](https://nextjs.org/docs/app/building-your-application/authentication#authorization)**: Decides what routes and data the user can access.

This diagram shows the authentication flow using React and Next.js features:

![Diagram showing the authentication flow with React and Next.js features](https://nextjs.org/_next/image?url=https%3A%2F%2Fh8DxKfmAPhn8O0p3.public.blob.vercel-storage.com%2Fdocs%2Flight%2Fauthentication-overview.png&w=3840&q=75)![Diagram showing the authentication flow with React and Next.js features](https://nextjs.org/_next/image?url=https%3A%2F%2Fh8DxKfmAPhn8O0p3.public.blob.vercel-storage.com%2Fdocs%2Fdark%2Fauthentication-overview.png&w=3840&q=75)

The examples on this page walk through basic username and password auth for educational purposes. While you can implement a custom auth solution, for increased security and simplicity, we recommend using an authentication library. These offer built-in solutions for authentication, session management, and authorization, as well as additional features such as social logins, multi-factor authentication, and role-based access control. You can find a list in the [Auth Libraries](https://nextjs.org/docs/app/building-your-application/authentication#auth-libraries) section.

## [Authentication](https://nextjs.org/docs/app/building-your-application/authentication#authentication)

### [Sign-up and login functionality](https://nextjs.org/docs/app/building-your-application/authentication#sign-up-and-login-functionality)

You can use the [`<form>`](https://react.dev/reference/react-dom/components/form) element with React's [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) and `useActionState` to capture user credentials, validate form fields, and call your Authentication Provider's API or database.

Since Server Actions always execute on the server, they provide a secure environment for handling authentication logic.

Here are the steps to implement signup/login functionality:

#### [1. Capture user credentials](https://nextjs.org/docs/app/building-your-application/authentication#1-capture-user-credentials)

To capture user credentials, create a form that invokes a Server Action on submission. For example, a signup form that accepts the user's name, email, and password:

```typescript
import { signup } from '@/app/actions/auth'

export function SignupForm() {
  return (
    <form action={signup}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" placeholder="Name" />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="Email" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
      </div>
      <button type="submit">Sign Up</button>
    </form>
  )
}

2. Validate form fields on the server

Use the Server Action to validate the form fields on the server. If your authentication provider doesn’t provide form validation, you can use a schema validation library like Zod or Yup.

Using Zod as an example, you can define a form schema with appropriate error messages:

import { z } from 'zod'

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .trim(),
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    })
    .trim(),
})

export type FormState =
  | {
      errors?: {
        name?: string[]
        email?: string[]
        password?: string[]
      }
      message?: string
    }
  | undefined

To prevent unnecessary calls to your authentication provider’s API or database, you can return early in the Server Action if any form fields do not match the defined schema.

import { SignupFormSchema, FormState } from '@/app/lib/definitions'

export async function signup(state: FormState, formData: FormData) {
  // Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Call the provider or db to create a user...
}

Back in your <SignupForm />, you can use React’s useActionState hook to display validation errors while the form is submitting:

'use client'

import { signup } from '@/app/actions/auth'
import { useActionState } from 'react'

export default function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <form action={action}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" placeholder="Name" />
      </div>
      {state?.errors?.name && <p>{state.errors.name}</p>}

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" placeholder="Email" />
      </div>
      {state?.errors?.email && <p>{state.errors.email}</p>}

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
      </div>
      {state?.errors?.password && (
        <div>
          <p>Password must:</p>
          <ul>
            {state.errors.password.map((error) => (
              <li key={error}>- {error}</li>
            ))}
          </ul>
        </div>
      )}
      <button disabled={pending} type="submit">
        Sign Up
      </button>
    </form>
  )
}

	Good to know:
		•	In React 19, useFormStatus includes additional keys on the returned object, like data, method, and action. If you are not using React 19, only the pending key is available.
	•	Before mutating data, you should always ensure a user is also authorized to perform the action. See Authentication and Authorization.

3. Create a user or check user credentials

After validating form fields, you can create a new user account or check if the user exists by calling your authentication provider’s API or database.

Continuing from the previous example:

export async function signup(state: FormState, formData: FormData) {
  // 1. Validate form fields
  // ...

  // 2. Prepare data for insertion into database
  const { name, email, password } = validatedFields.data
  // e.g. Hash the user's password before storing it
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. Insert the user into the database or call an Auth Library's API
  const data = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
    })
    .returning({ id: users.id })

  const user = data[0]

  if (!user) {
    return {
      message: 'An error occurred while creating your account.',
    }
  }

  // TODO:
  // 4. Create user session
  // 5. Redirect user
}

After successfully creating the user account or verifying the user credentials, you can create a session to manage the user’s auth state. Depending on your session management strategy, the session can be stored in a cookie or database, or both. Continue to the Session Management section to learn more.

	Tips:
		•	The example above is verbose since it breaks down the authentication steps for the purpose of education. This highlights that implementing your own secure solution can quickly become complex. Consider using an Auth Library to simplify the process.
	•	To improve the user experience, you may want to check for duplicate emails or usernames earlier in the registration flow. For example, as the user types in a username or the input field loses focus. This can help prevent unnecessary form submissions and provide immediate feedback to the user. You can debounce requests with libraries such as use-debounce to manage the frequency of these checks.

Session Management

Session management ensures that the user’s authenticated state is preserved across requests. It involves creating, storing, refreshing, and deleting sessions or tokens.

There are two types of sessions:
	1.	Stateless: Session data (or a token) is stored in the browser’s cookies. The cookie is sent with each request, allowing the session to be verified on the server. This method is simpler, but can be less secure if not implemented correctly.
	2.	Database: Session data is stored in a database, with the user’s browser only receiving the encrypted session ID. This method is more secure, but can be complex and use more server resources.

	Good to know: While you can use either method, or both, we recommend using a session management library such as iron-session or Jose.

Stateless Sessions

To create and manage stateless sessions, there are a few steps you need to follow:
	1.	Generate a secret key, which will be used to sign your session, and store it as an environment variable.
	2.	Write logic to encrypt/decrypt session data using a session management library.
	3.	Manage cookies using the Next.js cookies API.

In addition to the above, consider adding functionality to update (or refresh) the session when the user returns to the application, and delete the session when the user logs out.

	Good to know: Check if your auth library includes session management.

1. Generating a secret key

There are a few ways you can generate secret key to sign your session. For example, you may choose to use the openssl command in your terminal:

openssl rand -base64 32

This command generates a 32-character random string that you can use as your secret key and store in your environment variables file:

SESSION_SECRET=your_secret_key

You can then reference this key in your session management logic:

const secretKey = process.env.SESSION_SECRET

2. Encrypting and decrypting sessions

Next, you can use your preferred session management library to encrypt and decrypt sessions. Continuing from the previous example, we’ll use Jose (compatible with the Edge Runtime) and React’s server-only package to ensure that your session management logic is only executed on the server.

import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { SessionPayload } from '@/app/lib/definitions'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.log('Failed to verify session')
  }
}

	Tips:
		•	The payload should contain the minimum, unique user data that’ll be used in subsequent requests, such as the user’s ID, role, etc. It should not contain personally identifiable information like phone number, email address, credit card information, etc, or sensitive data like passwords.

3. Setting cookies (recommended options)

To store the session in a cookie, use the Next.js cookies API. The cookie should be set on the server, and include the recommended options:
	•	HttpOnly: Prevents client-side JavaScript from accessing the cookie.
	•	Secure: Use https to send the cookie.
	•	SameSite: Specify whether the cookie can be sent with cross-site requests.
	•	Max-Age or Expires: Delete the cookie after a certain period.
	•	Path: Define the URL path for the cookie.

Please refer to MDN for more information on each of these options.

import 'server-only'
import { cookies } from 'next/headers'

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId, expiresAt })
  const cookieStore = await cookies()

  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

Back in your Server Action, you can invoke the createSession() function, and use the redirect() API to redirect the user to the appropriate page:

import { createSession } from '@/app/lib/session'

export async function signup(state: FormState, formData: FormData) {
  // Previous steps:
  // 1. Validate form fields
  // 2. Prepare data for insertion into database
  // 3. Insert the user into the database or call an Library API

  // Current steps:
  // 4. Create user session
  await createSession(user.id)
  // 5. Redirect user
  redirect('/profile')
}

	Tips:
		•	Cookies should be set on the server to prevent client-side tampering.
	•	🎥 Watch: Learn more about stateless sessions and authentication with Next.js → YouTube (11 minutes).

Updating (or refreshing) sessions

You can also extend the session’s expiration time. This is useful for keeping the user logged in after they access the application again. For example:

import 'server-only'
import { cookies } from 'next/headers'
import { decrypt } from '@/app/lib/session'

export async function updateSession() {
  const session = (await cookies()).get('session')?.value
  const payload = await decrypt(session)

  if (!session || !payload) {
    return null
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}

	Tip: Check if your auth library supports refresh tokens, which can be used to extend the user’s session.

Deleting the session

To delete the session, you can delete the cookie:

import 'server-only'
import { cookies } from 'next/headers'

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

Then you can reuse the deleteSession() function in your application, for example, on logout:

import { cookies } from 'next/headers'
import { deleteSession } from '@/app/lib/session'

export async function logout() {
  deleteSession()
  redirect('/login')
}

Database Sessions

To create and manage database sessions, you’ll need to follow these steps:
	1.	Create a table in your database to store session and data (or check if your Auth Library handles this).
	2.	Implement functionality to insert, update, and delete sessions
	3.	Encrypt the session ID before storing it in the user’s browser, and ensure the database and cookie stay in sync (this is optional, but recommended for optimistic auth checks in Middleware).

For example:

import cookies from 'next/headers'
import { db } from '@/app/lib/db'
import { encrypt } from '@/app/lib/session'

export async function createSession(id: number) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  // 1. Create a session in the database
  const data = await db
    .insert(sessions)
    .values({
      userId: id,
      expiresAt,
    })
    // Return the session ID
    .returning({ id: sessions.id })

  const sessionId = data[0].id

  // 2. Encrypt the session ID
  const session = await encrypt({ sessionId, expiresAt })

  // 3. Store the session in cookies for optimistic auth checks
  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

	Tips:
		•	For faster data retrieval, consider using a database like Vercel Redis. However, you can also keep the session data in your primary database, and combine data requests to reduce the number of queries.
	•	You may opt to use database sessions for more advanced use cases, such as keeping track of the last time a user logged in, or number of active devices, or give users the ability to log out of all devices.

After implementing session management, you’ll need to add authorization logic to control what users can access and do within your application. Continue to the Authorization section to learn more.

Authorization

Once a user is authenticated and a session is created, you can implement authorization to control what the user can access and do within your application.

There are two main types of authorization checks:
	1.	Optimistic: Checks if the user is authorized to access a route or perform an action using the session data stored in the cookie. These checks are useful for quick operations, such as showing/hiding UI elements or redirecting users based on permissions or roles.
	2.	Secure: Checks if the user is authorized to access a route or perform an action using the session data stored in the database. These checks are more secure and are used for operations that require access to sensitive data or actions.

For both cases, we recommend:
	•	Creating a Data Access Layer to centralize your authorization logic
	•	Using Data Transfer Objects (DTO) to only return the necessary data
	•	Optionally use Middleware to perform optimistic checks.

Optimistic checks with Middleware (Optional)

There are some cases where you may want to use Middleware and redirect users based on permissions:
	•	To perform optimistic checks. Since Middleware runs on every route, it’s a good way to centralize redirect logic and pre-filter unauthorized users.
	•	To protect static routes that share data between users (e.g. content behind a paywall).

However, since Middleware runs on every route, including prefetched routes, it’s important to only read the session from the cookie (optimistic checks), and avoid database checks to prevent performance issues.

For example:

import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/app/lib/session'
import { cookies } from 'next/headers'

// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard']
const publicRoutes = ['/login', '/signup', '/']

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  // 5. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    session?.userId &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}

While Middleware can be useful for initial checks, it should not be your only line of defense in protecting your data. The majority of security checks should be performed as close as possible to your data source, see Data Access Layer for more information.

Creating a Data Access Layer (DAL)

We recommend creating a DAL to centralize your data requests and authorization logic.

The DAL should include a function that verifies the user’s session as they interact with your application. At the very least, the function should check if the session is valid, then redirect or return the user information needed to make further requests.

For example, create a separate file for your DAL that includes a verifySession() function. Then use React’s cache API to memoize the return value of the function during a React render pass:

import 'server-only'

import { cookies } from 'next/headers'
import { decrypt } from '@/app/lib/session'

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value
  const session = await decrypt(cookie)

  if (!session?.userId) {
    redirect('/login')
  }

  return { isAuth: true, userId: session.userId }
})

You can then invoke the verifySession() function in your data requests, Server Actions, Route Handlers:

export const getUser = cache(async () => {
  const session = await verifySession()
  if (!session) return null

  try {
    const data = await db.query.users.findMany({
      where: eq(users.id, session.userId),
      // Explicitly return the columns you need rather than the whole user object
      columns: {
        id: true,
        name: true,
        email: true,
      },
    })

    const user = data[0]

    return user
  } catch (error) {
    console.log('Failed to fetch user')
    return null
  }
})

	Tip:
		•	A DAL can be used to protect data fetched at request time. However, for static routes that share data between users, data will be fetched at build time and not at request time. Use Middleware to protect static routes.
	•	For secure checks, you can check if the session is valid by comparing the session ID with your database. Use React’s cache function to avoid unnecessary duplicate requests to the database during a render pass.
	•	You may wish to consolidate related data requests in a JavaScript class that runs verifySession() before any methods.

Using Data Transfer Objects (DTO)

When retrieving data, it’s recommended you return only the necessary data that will be used in your application, and not entire objects. For example, if you’re fetching user data, you might only return the user’s ID and name, rather than the entire user object which could contain passwords, phone numbers, etc.

However, if you have no control over the returned data structure, or are working in a team where you want to avoid whole objects being passed to the client, you can use strategies such as specifying what fields are safe to be exposed to the client.

import 'server-only'
import { getUser } from '@/app/lib/dal'

function canSeeUsername(viewer: User) {
  return true
}

function canSeePhoneNumber(viewer: User, team: string) {
  return viewer.isAdmin || team === viewer.team
}

export async function getProfileDTO(slug: string) {
  const data = await db.query.users.findMany({
    where: eq(users.slug, slug),
    // Return specific columns here
  })
  const user = data[0]

  const currentUser = await getUser(user.id)

  // Or return only what's specific to the query here
  return {
    username: canSeeUsername(currentUser) ? user.username : null,
    phonenumber: canSeePhoneNumber(currentUser, user.team)
      ? user.phonenumber
      : null,
  }
}

By centralizing your data requests and authorization logic in a DAL and using DTOs, you can ensure that all data requests are secure and consistent, making it easier to maintain, audit, and debug as your application scales.

	Good to know:
		•	There are a couple of different ways you can define a DTO, from using toJSON(), to individual functions like the example above, or JS classes. Since these are JavaScript patterns and not a React or Next.js feature, we recommend doing some research to find the best pattern for your application.
	•	Learn more about security best practices in our Security in Next.js article.

Server Components

Auth check in Server Components are useful for role-based access. For example, to conditionally render components based on the user’s role:

import { verifySession } from '@/app/lib/dal'

export default function Dashboard() {
  const session = await verifySession()
  const userRole = session?.user?.role // Assuming 'role' is part of the session object

  if (userRole === 'admin') {
    return <AdminDashboard />
  } else if (userRole === 'user') {
    return <UserDashboard />
  } else {
    redirect('/login')
  }
}

In the example, we use the verifySession() function from our DAL to check for ‘admin’, ‘user’, and unauthorized roles. This pattern ensures that each user interacts only with components appropriate to their role.

Layouts and auth checks

Due to Partial Rendering, be cautious when doing checks in Layouts as these don’t re-render on navigation, meaning the user session won’t be checked on every route change.

Instead, you should do the checks close to your data source or the component that’ll be conditionally rendered.

For example, consider a shared layout that fetches the user data and displays the user image in a nav. Instead of doing the auth check in the layout, you should fetch the user data ( getUser()) in the layout and do the auth check in your DAL.

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    // ...
  )
}

export const getUser = cache(async () => {
  const session = await verifySession()
  if (!session) return null

  // Get user ID from session and fetch data
})

	Good to know:
		•	A common pattern in SPAs is to return null in a layout or a top-level component if a user is not authorized. This pattern is not recommended since Next.js applications have multiple entry points, which will not prevent nested route segments and Server Actions from being accessed.

Server Actions

Treat Server Actions with the same security considerations as public-facing API endpoints, and verify if the user is allowed to perform a mutation.

In the example below, we check the user’s role before allowing the action to proceed:

'use server'
import { verifySession } from '@/app/lib/dal'

export async function serverAction(formData: FormData) {
  const session = await verifySession()
  const userRole = session?.user?.role

  // Return early if user is not authorized to perform the action
  if (userRole !== 'admin') {
    return null
  }

  // Proceed with the action for authorized users
}

Route Handlers

Treat Route Handlers with the same security considerations as public-facing API endpoints, and verify if the user is allowed to access the Route Handler.

For example:

import { verifySession } from '@/app/lib/dal'

export async function GET() {
  // User authentication and role verification
  const session = await verifySession()

  // Check if the user is authenticated
  if (!session) {
    // User is not authenticated
    return new Response(null, { status: 401 })
  }

  // Check if the user has the 'admin' role
  if (session.user.role !== 'admin') {
    // User is authenticated but does not have the right permissions
    return new Response(null, { status: 403 })
  }

  // Continue for authorized users
}

The example above demonstrates a Route Handler with a two-tier security check. It first checks for an active session, and then verifies if the logged-in user is an ‘admin’.

Context Providers

Using context providers for auth works due to interleaving. However, React context is not supported in Server Components, making them only applicable to Client Components.

This works, but any child Server Components will be rendered on the server first, and will not have access to the context provider’s session data:

import { ContextProvider } from 'auth-lib'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  )
}

"use client";

import { useSession } from "auth-lib";

export default function Profile() {
  const { userId } = useSession();
  const { data } = useSWR(`/api/user/${userId}`, fetcher)

  return (
    // ...
  );
}

If session data is needed in Client Components (e.g. for client-side data fetching), use React’s taintUniqueValue API to prevent sensitive session data from being exposed to the client.

Resources

Now that you’ve learned about authentication in Next.js, here are Next.js-compatible libraries and resources to help you implement secure authentication and session management:

Auth Libraries
	•	Auth0
	•	Clerk
	•	Kinde
	•	Logto
	•	NextAuth.js
	•	Ory
	•	Stack Auth
	•	Supabase
	•	Stytch
	•	WorkOS

Session Management Libraries
	•	Iron Session
	•	Jose

Further Reading

To continue learning about authentication and security, check out the following resources:
	•	How to think about security in Next.js
	•	Understanding XSS Attacks
	•	Understanding CSRF Attacks
	•	The Copenhagen Book

