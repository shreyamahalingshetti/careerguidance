import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mailer'
import { getResourcesForTopics, generateResourcesHtml } from '@/lib/resource-recommender'

export async function POST(req: Request) {
  try {
    const { email, type, name, weakTopics, score, total } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    let subject = ""
    let message = ""

    if (type === "welcome") {
      subject = "Welcome to Career Platform 🎉"
      message = `<p>Hi ${name || "there"},</p><p>Your account is successfully created! We're excited to have you onboard.</p>`
    } else if (type === "login") {
      subject = "New Login Alert 🔔"
      message = `<p>Hi ${name || "there"},</p><p>We noticed a new login to your account.</p>`
    } else if (type === "test_report") {
      subject = "Your Quiz Report is Ready 📊"
      const gapsMessage = weakTopics && weakTopics.length > 0
        ? `<p>We noticed you struggled with these subtopics: <strong>${weakTopics.join(', ')}</strong>. Consider revising them to strengthen your skills!</p>`
        : `<p>Great job! You showed strong understanding of the concepts.</p>`

      // Generate resource links for weak topics and include in email
      const topicResources = weakTopics && weakTopics.length > 0
        ? getResourcesForTopics(weakTopics)
        : []
      const resourcesHtml = generateResourcesHtml(topicResources)
      
      message = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2563eb;">Quiz Results</h2>
          <p>Hi ${name || "there"},</p>
          <p>You recently completed a video quiz on the learning roadmap.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="font-size: 22px; font-weight: bold; color: #1e40af; margin: 5px 0;">${score} / ${total}</p>
            <p>Score</p>
          </div>
          ${gapsMessage}
          ${resourcesHtml}
          <p>Keep up the great work learning!</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">This is an automated report from your Career Guidance App.</p>
        </div>
      `
    } else {
      return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    const result = await sendEmail({ to: email, subject, html: message })

    if (!result || !result.success) {
      console.error("Email delivery error:", result?.error)
      return NextResponse.json({ error: result?.error }, { status: 400 })
    }

    console.log("Email sent, ID:", result.messageId)
    return NextResponse.json({ success: true, id: result.messageId })
  } catch (error) {
    console.error("Failed to send email API:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}

