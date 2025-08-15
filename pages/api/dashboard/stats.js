import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '../../../lib/mongodb';
import { getMeetings, getForms } from '../../../lib/wordpress';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db('employee_management');
    const users = db.collection('users');
    const attendance = db.collection('attendance');

    // Get user from database
    const user = await users.findOne({ auth_id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      totalMeetings: 0,
      todayAttendance: 0,
      totalForms: 0
    });
  }
}

