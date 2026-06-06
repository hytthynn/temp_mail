import { NextResponse } from 'next/server';
import { saveEmail, Email } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // SendGrid and Mailgun typically send multipart/form-data for inbound webhooks
    const formData = await request.formData();
    
    // Extract fields (this format assumes SendGrid Inbound Parse)
    const to = formData.get('to') as string;
    const from = formData.get('from') as string;
    const subject = formData.get('subject') as string;
    const text = formData.get('text') as string;
    const html = formData.get('html') as string;
    
    if (!to) {
      return NextResponse.json({ error: 'Missing "to" field' }, { status: 400 });
    }

    // Extract the email address from a possible string like "Name <email@domain.com>"
    const emailMatch = to.match(/<([^>]+)>/);
    const cleanTo = emailMatch ? emailMatch[1] : to.trim();

    const newEmail: Email = {
      id: crypto.randomUUID(),
      to: cleanTo,
      from: from || 'Unknown Sender',
      subject: subject || 'No Subject',
      text: text || '',
      html: html || '',
      date: new Date().toISOString()
    };

    await saveEmail(cleanTo, newEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Always return 200 to webhooks even on internal error to prevent retries if we can't parse it
    // Or return 500 if we want them to retry. Let's use 500 for true server errors.
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
