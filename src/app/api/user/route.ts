import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// This API route returns the user information from the JWT session
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Return relevant user data from the session
    return NextResponse.json({
      firstName: session.firstName || '',
      lastName: session.lastName || '',
      dateOfBirth: session.dateOfBirth || '',
      userId: session.userId || ''
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
} 