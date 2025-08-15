import clientPromise from '../../../../lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { auth_id, name, email, profile_pic } = await request.json();

    if (!auth_id || !name || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('employee_management');
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({ auth_id });

    if (existingUser) {
      return NextResponse.json({ 
        success: true, 
        message: 'User already exists', 
        user: existingUser 
      });
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

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: { ...newUser, _id: result.insertedId },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error.message || error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
