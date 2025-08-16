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
    const db = client.db('teamboard');
    const users = db.collection('users');
    const attendance = db.collection('attendance');

    // Get user from database
    const user = await users.findOne({ auth_id: userId });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Get today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await attendance.findOne({
      user_id: user._id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    let todayHours = 0;
    let isCurrentlyActive = false;
    
    if (todayAttendance) {
      if (todayAttendance.worked_hours) {
        todayHours = todayAttendance.worked_hours;
      } else if (todayAttendance.login_time && !todayAttendance.logout_time) {
        // Calculate current hours if still logged in
        const now = new Date();
        const loginTime = new Date(todayAttendance.login_time);
        todayHours = Math.round(((now - loginTime) / (1000 * 60 * 60)) * 100) / 100;
        isCurrentlyActive = true;
      }
    }

    // Get overall attendance statistics
    const allAttendance = await attendance.find({
      user_id: user._id,
      worked_hours: { $exists: true, $ne: null }
    }).toArray();

    const totalHours = allAttendance.reduce((sum, record) => sum + (record.worked_hours || 0), 0);
    const totalDays = allAttendance.length;
    const averageHours = totalDays > 0 ? Math.round((totalHours / totalDays) * 100) / 100 : 0;

    // Get WordPress data
    const [meetings, forms] = await Promise.all([
      getMeetings(),
      getForms()
    ]);

    const stats = {
      totalMeetings: meetings.length,
      todayAttendance: todayHours,
      totalForms: forms.length,
      isCurrentlyActive,
      totalHours: Math.round(totalHours * 100) / 100,
      totalDays,
      averageHours
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
