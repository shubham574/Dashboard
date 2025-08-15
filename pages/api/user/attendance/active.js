import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '../../../../lib/mongodb';

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

    // Find active session
    const activeSession = await attendance.findOne({
      user_id: user._id,
      logout_time: null
    });

    res.status(200).json({ 
      activeSession: activeSession || null
    });
  } catch (error) {
    console.error('Error checking active session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
