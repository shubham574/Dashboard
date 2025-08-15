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

    const { meeting_id } = req.body;

    const client = await clientPromise;
    const db = client.db('employee_management');
    const users = db.collection('users');
    const attendance = db.collection('attendance');

    // Get user from database
    const user = await users.findOne({ auth_id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has an active session
    const activeSession = await attendance.findOne({
      user_id: user._id,
      logout_time: null
    });

    if (activeSession) {
      return res.status(400).json({ message: 'User already has an active session' });
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
    
    res.status(201).json({ 
      message: 'Attendance logged successfully',
      attendance: { ...attendanceRecord, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error logging attendance:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}