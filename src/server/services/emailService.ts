import SibApiV3Sdk from 'sib-api-v3-sdk';

// Interface definitions
interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailSender {
  name: string;
  email: string;
}

// Configure API key
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];

if (!process.env.SENDINBLUE_API_KEY) {
  console.warn('SENDINBLUE_API_KEY is not defined in environment variables');
} else {
  apiKey.apiKey = process.env.SENDINBLUE_API_KEY;
}

const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string, 
  name: string, 
  resetUrl: string
): Promise<Record<string, any>> {
  if (!process.env.SENDINBLUE_API_KEY) {
    console.warn('Skipping password reset email - API key not configured');
    return {};
  }

  try {
    const sendSmtpEmail = {
      to: [{ email, name }],
      templateId: parseInt(process.env.SENDINBLUE_TEMPLATE_ID || '1'),
      params: {
        resetUrl,
        name
      },
      sender: { 
        name: process.env.EMAIL_FROM_NAME || 'AI Crawler',
        email: process.env.EMAIL_FROM_ADDRESS || 'noreply@aicrawler.io' 
      }
    };

    return await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string, 
  name: string
): Promise<Record<string, any>> {
  if (!process.env.SENDINBLUE_API_KEY) {
    console.warn('Skipping welcome email - API key not configured');
    return {};
  }

  try {
    const sendSmtpEmail = {
      to: [{ email, name }],
      templateId: parseInt(process.env.SENDINBLUE_WELCOME_TEMPLATE_ID || '2'),
      params: {
        name
      },
      sender: { 
        name: process.env.EMAIL_FROM_NAME || 'AIrCrawl Support',
        email: process.env.EMAIL_FROM_ADDRESS || 'amoroso.tech@gmail.com' 
      }
    };

    return await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

/**
 * Send notification email
 */
export async function sendNotificationEmail(
  email: string, 
  name: string, 
  subject: string, 
  message: string
): Promise<Record<string, any>> {
  if (!process.env.SENDINBLUE_API_KEY) {
    console.warn('Skipping notification email - API key not configured');
    return {};
  }

  try {
    const sendSmtpEmail = {
      to: [{ email, name }],
      templateId: parseInt(process.env.SENDINBLUE_NOTIFICATION_TEMPLATE_ID || '3'),
      subject: subject,
      htmlContent: message,
      sender: { 
        name: process.env.EMAIL_FROM_NAME || 'AIrCrawl Support',
        email: process.env.EMAIL_FROM_ADDRESS || 'amoroso.tech@gmail.com' 
      }
    };

    return await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw error;
  }
}