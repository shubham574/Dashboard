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

    // Get attendance history
    const attendanceHistory = await attendance
      .find({ user_id: user._id })
      .sort({ date: -1, login_time: -1 })
      .limit(50)
      .toArray();

    // Calculate stats
    const completedSessions = attendanceHistory.filter(record => record.worked_hours);
    const totalHours = completedSessions.reduce((sum, record) => sum + (record.worked_hours || 0), 0);
    const totalDays = completedSessions.length;
    const averageHours = totalDays > 0 ? Math.round((totalHours / totalDays) * 100) / 100 : 0;

    const stats = {
      totalHours: Math.round(totalHours * 100) / 100,
      totalDays,
      averageHours
    };

    return NextResponse.json({ 
      attendance: attendanceHistory,
      stats
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
