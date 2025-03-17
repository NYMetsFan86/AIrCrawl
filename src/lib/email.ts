import SibApiV3Sdk from 'sib-api-v3-sdk';
import { 
  sendPasswordResetEmail as serviceResetEmail,
  sendWelcomeEmail,
  sendNotificationEmail
} from '../server/services/emailService';

/**
 * Sends a password reset email using a Sendinblue template.
 *
 * @param email - User's email address
 * @param name - User's name
 * @param resetUrl - URL for resetting the password
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<void> {
  try {
    // Try to use the service function first
    await serviceResetEmail(email, name, resetUrl);
  } catch (error) {
    console.warn('Failed to use service email function, falling back to direct implementation', error);
    
    // Initialize the Sendinblue API client
    const client = SibApiV3Sdk.ApiClient.instance;
    
    if (!process.env.SENDINBLUE_API_KEY) {
      throw new Error('SENDINBLUE_API_KEY is not defined in environment variables');
    }
    
    client.authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;
    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    
    // Configure the email
    const sendSmtpEmail = {
      to: [{ email, name }],
      templateId: parseInt(process.env.SENDINBLUE_TEMPLATE_ID || '1'),
      params: {
        resetUrl,
        name
      },
      sender: { 
        name: process.env.EMAIL_FROM_NAME || 'AIrCrawl Support',
        email: process.env.EMAIL_FROM_ADDRESS || 'amoroso.tech@gmail.com' 
      }
    };
    try {
      await tranEmailApi.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
}

// Re-export the additional functions for compatibility
export {
  sendWelcomeEmail,
  sendNotificationEmail
};