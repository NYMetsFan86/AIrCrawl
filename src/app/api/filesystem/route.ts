import { NextResponse } from 'next/server';
import { ensureDirectoryExists } from '@/lib/server-utils';

export async function POST(request: Request) {
  try {
    const { path } = await request.json();
    
    // Security check: Only allow creating directories within a specific area
    // This is important to prevent arbitrary filesystem access
    if (!path || typeof path !== 'string' || path.includes('..')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    
    ensureDirectoryExists(path);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating directory:', error);
    return NextResponse.json({ error: 'Failed to create directory' }, { status: 500 });
  }
}
