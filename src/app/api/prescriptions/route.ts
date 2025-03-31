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
    const prescriptions = await prisma.$queryRawUnsafe(
      `SELECT * FROM patient_rx 
      WHERE patient_id = ${parseInt(session.userId as string)}
      ORDER BY date_issued DESC`
    );
    
    return NextResponse.json(prescriptions);
    
  } catch (error) {
    console.error('Error fetching prescription data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching prescription data' },
      { status: 500 }
    );
  }
} 