import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getToken } from 'next-auth/jwt';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Return the user info from session
    const sessionResponse = NextResponse.json({
      id: session.user.id || 'default-user-id',
      name: session.user.name,
      email: session.user.email,
    });

    const token = await getToken({ req: request as any });
    
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Return the user info from token
    const tokenResponse = NextResponse.json({ 
      id: token.id,
      email: token.email,
      name: token.name
    });

    // Combine both responses or choose one based on your logic
    return sessionResponse; // or return tokenResponse;
  } catch (error) {
    console.error('Error in auth/me route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}