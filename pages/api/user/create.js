import clientPromise from '../../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { auth_id, name, email, profile_pic } = req.body;

    if (!auth_id || !name || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const client = await clientPromise;
    const db = client.db('employee_management');
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ auth_id });

    if (existingUser) {
      return res.status(200).json({ success: true, message: 'User already exists', user: existingUser });
    }

    // Create new user
    const newUser = {
      auth_id,
      name,
      email,
      profile_pic: profile_pic || null,
      join_date: new Date(),
    };

    const result = await users.insertOne(newUser);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: { ...newUser, _id: result.insertedId },
    });

  } catch (error) {
    console.error('Error creating user:', error.message || error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
