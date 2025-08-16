import { auth } from '@clerk/nextjs/server';
import clientPromise from '../../../../../lib/mongodb';
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

    // Get user from database
    const user = await users.findOne({ auth_id: userId });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Find active session
    const activeSession = await attendance.findOne({
      user_id: user._id,
      logout_time: null
    });

    return NextResponse.json({ 
      activeSession: activeSession || null
    });
  } catch (error) {
    console.error('Error checking active session:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
