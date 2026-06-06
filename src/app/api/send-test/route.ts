import { NextResponse } from 'next/server';
import { saveEmail, Email } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { address, subject, text, html } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    const newEmail: Email = {
      id: crypto.randomUUID(),
      to: address,
      from: 'test-system@auramail.local',
      subject: subject || 'Тестовое приветственное письмо ✨',
      text: text || 'Добро пожаловать в AuraMail! Это тестовое письмо.',
      html: html || `
        <div style="font-family: sans-serif; padding: 20px; background: #05050f; color: #fff; border-radius: 8px;">
          <h2 style="color: #00f2fe;">Добро пожаловать в AuraMail! ✨</h2>
          <p style="color: #a0a5b8;">Ваш временный почтовый ящик <strong>${address}</strong> успешно создан и готов к работе.</p>
          <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-left: 4px solid #f093fb; border-radius: 4px;">
            Это тестовое сообщение, сгенерированное локально.
          </div>
        </div>
      `,
      date: new Date().toISOString()
    };

    await saveEmail(address, newEmail);

    return NextResponse.json({ success: true, email: newEmail });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
