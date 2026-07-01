/**
 * Twilio REST API integration for real SMS and WhatsApp notifications.
 */

export interface TwilioResult {
  success: boolean;
  sid?: string;
  error?: string;
}

export async function sendTwilioSMS(to: string, body: string): Promise<TwilioResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    return {
      success: false,
      error: "Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER in environment variables.",
    };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);
    const params = new URLSearchParams();
    params.append("To", to);
    params.append("From", from);
    params.append("Body", body);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const json = await res.json();
    if (res.ok) {
      return { success: true, sid: json.sid };
    } else {
      return { success: false, error: json.message || `HTTP ${res.status}: ${res.statusText}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Network request failed" };
  }
}

export async function sendTwilioWhatsApp(to: string, body: string): Promise<TwilioResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !from) {
    return {
      success: false,
      error: "Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_WHATSAPP_NUMBER in environment variables.",
    };
  }

  try {
    const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const formattedFrom = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);
    const params = new URLSearchParams();
    params.append("To", formattedTo);
    params.append("From", formattedFrom);
    params.append("Body", body);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const json = await res.json();
    if (res.ok) {
      return { success: true, sid: json.sid };
    } else {
      return { success: false, error: json.message || `HTTP ${res.status}: ${res.statusText}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Network request failed" };
  }
}

import twilio from "twilio";

export async function sendInquiryWhatsAppNotification(inquiry: {
  name: string;
  parentName?: string;
  phone: string;
  grade: string;
  createdAt: string;
}): Promise<TwilioResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  const to = process.env.SCHOOL_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !from || !to) {
    return {
      success: false,
      error: "Missing Twilio credentials or WhatsApp configuration in environment variables.",
    };
  }

  try {
    const client = twilio(accountSid, authToken);
    const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const formattedFrom = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;

    const body = `New inquiry submitted:\n` +
      `- Student Name: ${inquiry.name}\n` +
      `- Parent Name: ${inquiry.parentName || "N/A"}\n` +
      `- Phone Number: ${inquiry.phone}\n` +
      `- Class: ${inquiry.grade}\n` +
      `- Timestamp: ${inquiry.createdAt}`;

    const message = await client.messages.create({
      body: body,
      from: formattedFrom,
      to: formattedTo,
    });

    return { success: true, sid: message.sid };
  } catch (err: any) {
    return { success: false, error: err.message || "Twilio SDK request failed" };
  }
}

export async function sendTelegramMessage(body: string): Promise<TwilioResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      success: false,
      error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment variables.",
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: body,
      }),
    });

    const json = await res.json();
    if (res.ok && json.ok) {
      return { success: true, sid: json.result?.message_id?.toString() };
    } else {
      return { success: false, error: json.description || `HTTP ${res.status}: ${res.statusText}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Network request failed" };
  }
}
