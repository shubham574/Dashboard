import { auth } from '@clerk/nextjs/server';
import clientPromise from '../../../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('employee_management');
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

    if (!activeSession) {
      return NextResponse.json({ message: 'No active session found' }, { status: 400 });
    }

    // Calculate worked hours
    const logoutTime = new Date();
    const loginTime = new Date(activeSession.login_time);
    const workedHours = Math.round(((logoutTime - loginTime) / (1000 * 60 * 60)) * 100) / 100;

    // Update attendance record
    await attendance.updateOne(
      { _id: activeSession._id },
      {
        $set: {
          logout_time: logoutTime,
          worked_hours: workedHours
        }
      }
    );

    return NextResponse.json({ 
      message: 'Logout successful',
      worked_hours: workedHours
    });
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
