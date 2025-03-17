/**
 * Handles the forgot password request.
 * Generates a reset token, saves it to the user's record, and sends a password reset email.
 * 
 * @async
 * @param {import("express").Request} req - Express request object containing the user's email
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>} - JSON response indicating the outcome
 */

/**
 * Handles the reset password request.
 * Verifies the reset token, updates the user's password if valid.
 * 
 * @async
 * @param {import("express").Request} req - Express request object containing the reset token and new password
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>} - JSON response indicating the outcome
 */
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import express from 'express';
import { sendPasswordResetEmail } from '@/lib/email';
// Generate reset token and save to user
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    
    // Find user with Prisma
    const user = await db.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // Security best practice: don't reveal if user exists
      return res.status(200).json({ message: 'Password reset email sent if account exists' });
    }
    
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and save to user
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Update user with Prisma
    await db.user.update({
      where: { id: user.id },
      data: {
        reset_password_token: hashedToken,
        reset_password_expires: new Date(Date.now() + 3600000) // 1 hour
      }
    });
    
    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    // Send email
    await sendPasswordResetEmail(user.email ?? '', user.name ?? 'User', resetUrl);
    
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
}

// Reset password with token
/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }
    
    // Hash the received token to compare with stored token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with matching token and token not expired
    const user = await db.user.findFirst({
      where: {
        reset_password_token: hashedToken,
        reset_password_expires: {
          gt: new Date()  // Not expired
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user with Prisma
    await db.user.update({
      where: { id: user.id },
      data: {
        hashedPassword: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null
      }
    });
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in reset password:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
}