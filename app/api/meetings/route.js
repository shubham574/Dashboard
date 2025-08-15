import { getMeetings } from '../../../lib/wordpress';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const meetings = await getMeetings();
    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}
