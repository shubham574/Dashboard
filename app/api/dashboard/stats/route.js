import { auth } from '@clerk/nextjs/server';
import clientPromise from '../../../../lib/mongodb';
import { getMeetings, getForms } from '../../../../lib/wordpress';
import { NextResponse } from 'next/server';

export async function GET() {
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

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await attendance.findOne({
      user_id: user._id,
      date: today
    });

    let todayHours = 0;
    if (todayAttendance) {
      if (todayAttendance.worked_hours) {
        todayHours = todayAttendance.worked_hours;
      } else if (todayAttendance.login_time) {
        // Calculate current hours if still logged in
        const now = new Date();
        const loginTime = new Date(todayAttendance.login_time);
        todayHours = Math.round(((now - loginTime) / (1000 * 60 * 60)) * 100) / 100;
      }
    }

    // Get WordPress data
    const [meetings, forms] = await Promise.all([
      getMeetings(),
      getForms()
    ]);

    const stats = {
      totalMeetings: meetings.length,
      todayAttendance: todayHours,
      totalForms: forms.length
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ 
      totalMeetings: 0,
      todayAttendance: 0,
      totalForms: 0
    }, { status: 500 });
  }
}
