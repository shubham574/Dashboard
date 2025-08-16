import { auth } from '@clerk/nextjs/server';
import clientPromise from '../../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST() {
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
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Find active session for today
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

    if (!activeSession) {
      return NextResponse.json({
        success: false,
        message: 'No active session found'
      }, { status: 404 });
    }

    // Calculate working hours
    const logoutTime = new Date();
    const loginTime = new Date(activeSession.login_time);
    const workedHours = (logoutTime - loginTime) / (1000 * 60 * 60); // Convert to hours

    // Update attendance record
    const result = await attendance.updateOne(
      { _id: activeSession._id },
      {
        $set: {
          logout_time: logoutTime,
          worked_hours: Math.round(workedHours * 100) / 100, // Round to 2 decimal places
          updated_at: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update attendance record'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully logged out',
      worked_hours: Math.round(workedHours * 100) / 100
    });

  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
