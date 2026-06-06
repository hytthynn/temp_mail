import { NextResponse } from 'next/server';
import { saveEmail, Email } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Mailgun inbound webhook fields
    const to = (formData.get('recipient') as string)
      || (formData.get('to') as string);
    const from = (formData.get('sender') as string)
      || (formData.get('from') as string);
    const subject = formData.get('subject') as string;
    const text = formData.get('body-plain') as string;
    const html = formData.get('body-html') as string;

    if (!to) {
      return NextResponse.json({ error: 'Missing recipient' }, { status: 400 });
    }

    const cleanTo = to.trim().toLowerCase();

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
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
