import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Mock response for now
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
