

import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const smsNumber = process.env.TWILIO_PHONE_NUMBER!;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER!;

const client = twilio(accountSid, authToken);

/**
 * Send a standard SMS
 */
export const sendSMS = async (to: string, message: string) => {
  try {
   
    
    const response = await client.messages.create({
      body: message,
      from: smsNumber,
      to,
    });

    return response;  // Returning the response to capture status if needed
  } catch (error) {
  }
};

/**
 * Send a WhatsApp message
 */
export const sendWhatsApp = async (to: string, message: string) => {
  try {

    
    const response = await client.messages.create({
      body: message,
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${to}`,
    });

    return response;  // Returning the response to capture status if needed
  } catch (error) {

  }
};
