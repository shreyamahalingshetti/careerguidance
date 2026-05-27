import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('Mailer Error: RESEND_API_KEY is not set in environment variables');
    return { success: false, error: 'Missing Resend API key' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Career Guidance App <onboarding@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend email error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully via Resend:', data?.id, '→', to);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('Error sending email via Resend:', error?.message || error);
    return { success: false, error: error?.message || error };
  }
}

