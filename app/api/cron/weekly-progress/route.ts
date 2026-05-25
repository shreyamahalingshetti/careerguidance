import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mailer'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Add a simple security key check to prevent unauthorized execution
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch all student users alongside their pending and completed recommendations/tasks (for demonstration of streaks)
    // We'll use the user's assessments and saved careers as a simple progress metric
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        assessments: true,
        savedCareers: true,
      }
    })

    const emailPromises = users.map(async (user) => {
      if (!user.email) return;

      const completedAssessments = user.assessments.filter((a) => a.completed).length;
      const savedPathways = user.savedCareers.length;
      const streakMessage = completedAssessments > 0 && savedPathways > 0 
        ? "You're on a great streak! You've taken your assessments and mapped out pathways."
        : "Let's keep your progress going! Have you checked your assessments yet?";

      const message = `
        <p>Hi ${user.name || 'there'},</p>
        <p>Your progress this way.</p>
        <p>You have completed ${completedAssessments} assessments and saved ${savedPathways} career pathways.</p>
        <p><strong>${streakMessage}</strong></p>
        <p>Still need to complete this. Implement this.</p>
        <p>Head back to the platform and continue progressing!</p>
      `;

      return sendEmail({
        to: user.email,
        subject: "Your Weekly Career Progress 📈",
        html: message,
      })
    });

    await Promise.allSettled(emailPromises);

    return NextResponse.json({ success: true, usersEmailed: users.length })
  } catch (error) {
    console.error("Weekly progress cron error:", error);
    return NextResponse.json({ error: 'Failed to send weekly progress' }, { status: 500 })
  }
}
