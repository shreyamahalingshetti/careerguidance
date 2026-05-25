import nodemailer from 'nodemailer';

// Gmail SMTP via App Password (spaces must be removed from the 16-char app password)
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.error('Mailer Error: GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env');
    return { success: false, error: 'Missing email credentials' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Career Guidance App" <${user}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', info.messageId, '→', to);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Error sending email via Nodemailer:', error?.message || error);
    return { success: false, error: error?.message || error };
  }
}
