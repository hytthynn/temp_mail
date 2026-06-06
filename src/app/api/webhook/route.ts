import { NextResponse } from 'next/server';
import { saveEmail, Email, EmailAttachment } from '@/lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const to = (formData.get('recipient') as string)
      || (formData.get('to') as string);
    const from = (formData.get('sender') as string)
      || (formData.get('from') as string);
    const subject = formData.get('subject') as string;
    const text = formData.get('body-plain') as string;
    const html = (formData.get('body-html') as string) || '';

    if (!to) {
      return NextResponse.json({ error: 'Missing recipient' }, { status: 400 });
    }

    const cleanTo = to.trim().toLowerCase();

    const attachments: EmailAttachment[] = [];
    let totalSize = 0;
    const MAX_BASE64_SIZE = 3_000_000;

    for (let i = 1; i <= 20; i++) {
      const file = formData.get(`attachment-${i}`);
      if (!file || !(file instanceof File)) break;

      const infoStr = formData.get(`attachment-${i}-info`) as string;
      let filename = file.name || `attachment-${i}`;
      let contentType = file.type || 'application/octet-stream';

      if (infoStr) {
        try {
          const info = JSON.parse(infoStr);
          filename = info.filename || filename;
          contentType = info['content-type'] || contentType;
        } catch {}
      }

      // Only process images
      if (!contentType.startsWith('image/')) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');
      totalSize += base64.length;

      if (totalSize > MAX_BASE64_SIZE) break;

      attachments.push({
        filename,
        contentType,
        content: `data:${contentType};base64,${base64}`,
      });
    }

    const newEmail: Email = {
      id: crypto.randomUUID(),
      to: cleanTo,
      from: from || 'Unknown Sender',
      subject: subject || 'No Subject',
      text: text || '',
      html: html || '',
      date: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    await saveEmail(cleanTo, newEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
