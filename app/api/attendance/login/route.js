import { auth } from '@clerk/nextjs/server';
import clientPromise from '../../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { meeting_id } = await request.json();
    if (!meeting_id) {
      return NextResponse.json({ message: 'Meeting ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('teamboard');
    const users = db.collection('users');
    const attendance = db.collection('attendance');

    // Get or create user
    let user = await users.findOne({ auth_id: userId });
    if (!user) {
      const userResult = await users.insertOne({
        auth_id: userId,
        created_at: new Date(),
        updated_at: new Date()
      });
      user = { _id: userResult.insertedId, auth_id: userId };
    }

    // Check if user already has an active session today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingActiveSession = await attendance.findOne({
      user_id: user._id,
      date: {
        $gte: today,
        $lt: tomorrow
      },
      logout_time: null
    });

    if (existingActiveSession) {
      return NextResponse.json({
        success: false,
        message: 'User already has an active session'
      }, { status: 400 });
    }

    // Create new attendance record
    const attendanceRecord = {
      user_id: user._id,
      meeting_id: meeting_id,
      date: new Date(),
      login_time: new Date(),
      logout_time: null,
      worked_hours: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await attendance.insertOne(attendanceRecord);

    return NextResponse.json({
      success: true,
      attendance: {
        _id: result.insertedId,
        ...attendanceRecord
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
