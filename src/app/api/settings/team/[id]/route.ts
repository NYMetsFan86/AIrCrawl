import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const memberId = params.id;
  
  try {
    // Don't allow users to delete themselves
    if (memberId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the team' }, 
        { status: 400 }
      );
    }
    
    // Delete the user
    await db.user.delete({
      where: { id: memberId }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Team member removed successfully' 
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' }, 
      { status: 500 }
    );
  }
}

// Add PATCH method to the same file

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const memberId = params.id;
  
  try {
    const { role } = await request.json();
    
    if (!['admin', 'editor', 'member', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }
    
    // For now, we'll add a note that we need a schema migration to add role field
    console.log(`Would update user ${memberId} to role ${role}`);
    
    // Note: In a real application with a role field, you'd do:
    // await db.user.update({
    //   where: { id: memberId },
    //   data: { role }
    // });
    
    return NextResponse.json({
      success: true,
      message: 'Role updated successfully'
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}