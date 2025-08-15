import { auth } from '@clerk/nextjs/server';
import clientPromise from '../../../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { meeting_id } = await request.json();

    const client = await clientPromise;
    const db = client.db('employee_management');
    const users = db.collection('users');
    const attendance = db.collection('attendance');

    // Get user from database
    const user = await users.findOne({ auth_id: userId });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Check if user already has an active session
    const activeSession = await attendance.findOne({
      user_id: user._id,
      logout_time: null
    });

    if (activeSession) {
      return NextResponse.json({ message: 'User already has an active session' }, { status: 400 });
    }

    // Create new attendance record
    const today = new Date();
    const attendanceRecord = {
      user_id: user._id,
      meeting_id,
      date: today.toISOString().split('T')[0], // YYYY-MM-DD format
      login_time: today,
      logout_time: null,
      worked_hours: null,
    };

    const result = await attendance.insertOne(attendanceRecord);
    
    return NextResponse.json({ 
      message: 'Attendance logged successfully',
      attendance: { ...attendanceRecord, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error('Error logging attendance:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
