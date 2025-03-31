import { NextRequest, NextResponse } from 'next/server';
import { authenticate, createSession, hashPassword } from '@/lib/auth';

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