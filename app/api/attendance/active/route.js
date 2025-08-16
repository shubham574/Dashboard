import { auth } from '@clerk/nextjs/server';
import clientPromise from '../../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('teamboard');
    const users = db.collection('users');
    const attendance = db.collection('attendance');

    // Get user
    const user = await users.findOne({ auth_id: userId });
    if (!user) {
      return NextResponse.json({ activeSession: null });
    }

    // Check for active session today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeSession = await attendance.findOne({
      user_id: user._id,
      date: {
        $gte: today,
        $lt: tomorrow
      },
      logout_time: null
    });

    return NextResponse.json({ 
      activeSession: activeSession || null 
    });

  } catch (error) {
    console.error('Error fetching active session:', error);
    return NextResponse.json(
      { message: 'Failed to fetch active session' },
      { status: 500 }
    );
  }
}
