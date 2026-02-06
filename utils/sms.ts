import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!, {
    logLevel: 'debug'
});

export const sendSMS = async (to: string, body: string): Promise<object> => {
  try {
    // Validate inputs
    if (!to || !body) {
      throw new Error('Phone number and message body are required');
    }

    // Send the SMS
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    });

    console.log('SMS sent successfully:', message.sid); // Log the message SID for confirmation
    return message;
  } catch (error: unknown) {
    console.error('Failed to send SMS:', (error as Error).message || error); // Log actual error details
    throw new Error('Failed to send SMS: ' + ((error as Error).message || 'Unknown error')); // Send back more detailed error
  }
};
