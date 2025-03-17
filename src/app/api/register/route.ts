import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check if this is the first user (if so, make them an admin)
    const userCount = await db.user.count();
    const isFirstUser = userCount === 0;

    // Create the user
    const user = await db.user.create({
      data: {
        name,
        email,
        password, // Password should already be hashed from the client
        role: isFirstUser ? 'ADMIN' : 'USER',
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: userWithoutPassword,
        isFirstUser
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}