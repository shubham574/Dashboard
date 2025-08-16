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

    // Get current month start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get all users who have active sessions today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find all active sessions for today
    const activeSessions = await attendance.find({
      date: {
        $gte: today,
        $lt: tomorrow
      },
      logout_time: null
    }).toArray();

    if (activeSessions.length === 0) {
      return NextResponse.json({ employees: [] });
    }

    // Get user details for active employees
    const activeUserIds = activeSessions.map(session => session.user_id);
    const activeUsers = await users.find({
      _id: { $in: activeUserIds }
    }).toArray();

    // Calculate monthly hours for each active employee
    const employees = await Promise.all(
      activeUsers.map(async (user) => {
        // Get all attendance records for this month
        const monthlyAttendance = await attendance.find({
          user_id: user._id,
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth
          },
          worked_hours: { $exists: true, $ne: null }
        }).toArray();

        const totalMonthlyHours = monthlyAttendance.reduce(
          (sum, record) => sum + (record.worked_hours || 0), 
          0
        );

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          profilePic: user.profile_pic,
          totalMonthlyHours: Math.round(totalMonthlyHours * 100) / 100,
          isCurrentlyActive: true
        };
      })
    );

    // Sort by total monthly hours (descending)
    employees.sort((a, b) => b.totalMonthlyHours - a.totalMonthlyHours);

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Error fetching active employee stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch employee stats' },
      { status: 500 }
    );
  }
}
