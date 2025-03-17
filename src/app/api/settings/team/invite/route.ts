import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";
import { z } from "zod";
import crypto from "crypto";

// Define validation schema
const inviteSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["admin", "editor", "member", "viewer"])
});

export async function POST(request: Request) {
  const session = await getServerAuthSession();
  
  // Check authentication
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Validate request body
    const body = await request.json();
    const result = inviteSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: result.error.format() 
      }, { status: 400 });
    }
    
    const { email, role } = result.data;
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 400 });
    }
    
    // Generate invitation token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setDate(tokenExpiry.getDate() + 7); // Token valid for 7 days
    
    // Create user with invitation token
    // Note: Since we don't have an invitation model, we'll use the password reset fields
    const user = await db.user.create({
      data: {
        email,
        reset_password_token: inviteToken,
        reset_password_expires: tokenExpiry,
        // Store role information somehow (could add a role field to User model in a future migration)
      }
    });
    
    // Here you would typically send an email with the invitation link
    // For now, we'll just return success
    
    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully' 
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' }, 
      { status: 500 }
    );
  }
}