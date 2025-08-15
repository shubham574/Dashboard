import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { meeting_id } = await request.json();
    
    // Mock response for now
    return NextResponse.json({
      success: true,
      attendance: {
        meeting_id,
        login_time: new Date().toISOString(),
        user_id: 'mock-user-id'
      }
    });
  } catch (error) {
    console.error('Error logging attendance:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
