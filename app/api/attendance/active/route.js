import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return empty active session for now
    return NextResponse.json({ activeSession: null });
  } catch (error) {
    console.error('Error fetching active session:', error);
    return NextResponse.json(
      { message: 'Failed to fetch active session' },
      { status: 500 }
    );
  }
}
