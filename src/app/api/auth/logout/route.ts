import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear authentication cookies
    const cookieStore = await cookies();
    
    // Clear any auth-related cookies
    // Adjust these names to match your actual cookie names
    cookieStore.delete('token');
    cookieStore.delete('session');
    cookieStore.delete('auth');
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}