import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userId = "cm7o5xptd000065feuk19sqg6";
    
    // Try to find the user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    return NextResponse.json({ 
      found: Boolean(user), 
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      } : null
    });
  } catch (error) {
    console.error('Error finding user:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}