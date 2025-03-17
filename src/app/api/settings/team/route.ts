import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";

export async function GET() {
  const session = await getServerAuthSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Fetch all users from the database
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        // We don't have a dedicated role field in User model, so we'll determine it separately
      }
    });
    
    // Convert to team members format
    // Include the current user as an admin
    const members = users.map(user => ({
      id: user.id,
      name: user.name || 'Unnamed User',
      email: user.email || 'No Email',
      role: user.id === session.user.id ? 'admin' : 'member',
    }));
    
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' }, 
      { status: 500 }
    );
  }
}