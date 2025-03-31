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
    const labResults = await prisma.$queryRawUnsafe(
      `SELECT * FROM patient_lab_results 
      WHERE patient_id = ${parseInt(session.userId as string)}
      ORDER BY date DESC`
    );
    
    return NextResponse.json(labResults);
    
  } catch (error) {
    console.error('Error fetching lab results data:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching lab results data' },
      { status: 500 }
    );
  }
} 