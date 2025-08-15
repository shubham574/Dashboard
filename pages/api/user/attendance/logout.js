import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '../../../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    // Find active session
    const activeSession = await attendance.findOne({
      user_id: user._id,
      logout_time: null
    });

    if (!activeSession) {
      return res.status(400).json({ message: 'No active session found' });
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

    res.status(200).json({ 
      message: 'Logout successful',
      worked_hours: workedHours
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
