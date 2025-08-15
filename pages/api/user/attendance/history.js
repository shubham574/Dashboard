import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '../../../../../lib/mongodb';

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

    res.status(200).json({ 
      attendance: attendanceHistory,
      stats
    });
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}