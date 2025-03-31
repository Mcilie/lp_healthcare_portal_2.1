import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get session to verify authentication and get userId
    const session = await getSession();
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Query the database using raw SQL since we're using raw SQL tables
    const bills = await prisma.$queryRawUnsafe(
      `SELECT * FROM patient_billing 
      WHERE patient_id = ${parseInt(session.userId as string)}
      ORDER BY created_at DESC`
    );
    
    return NextResponse.json(bills);
    
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching billing data' },
      { status: 500 }
    );
  }
} 