import { NextResponse } from "next/server";
import { Resend } from "resend";
import { fetchAllDatabasePages } from "@/lib/notion";
import { aggregateAnalytics } from "@/lib/analytics";

export const dynamic = "force-dynamic";

function generateEmailHtml(title: string, bodyText: string) {
  // Convert line breaks to paragraphs/breaks safely
  const formattedBody = bodyText
    .split("\n\n")
    .map((paragraph) => `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #334155; font-size: 15px;">${paragraph.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; border-bottom: 1px dashed #cbd5e1;">
              <span style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                Draftr<span style="color: #ea580c;">.</span>
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                ${title}
              </h1>
              ${formattedBody}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
                You are receiving this update because you joined the Draftr waitlist.
              </p>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                &copy; ${new Date().getFullYear()} Draftr. Crafted with care.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const notionApiKey = process.env.NOTION_API_KEY;
    const databaseId = process.env.NOTION_DATABASE_ID;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Draftr <onboarding@resend.dev>";

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured in your environment variables." },
        { status: 500 }
      );
    }

    if (!notionApiKey || !databaseId) {
      return NextResponse.json(
        { error: "Notion credentials are not configured." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { subject, message, audience, testEmail } = body as {
      subject?: string;
      message?: string;
      audience?: "All" | "Active" | "Pending";
      testEmail?: string;
    };

    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: "Email subject line is required." }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Email message body is required." }, { status: 400 });
    }

    const resend = new Resend(resendApiKey);
    const html = generateEmailHtml(subject.trim(), message.trim());

    // If a test email is provided, send only to test email
    if (testEmail && testEmail.trim()) {
      const emailTarget = testEmail.trim().toLowerCase();
      const sendResult = await resend.emails.send({
        from: fromEmail,
        to: emailTarget,
        subject: `[TEST] ${subject.trim()}`,
        html,
      });

      if (sendResult.error) {
        return NextResponse.json(
          { error: `Resend error: ${sendResult.error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        isTest: true,
        recipientCount: 1,
        message: `Test email sent successfully to ${emailTarget}`,
      });
    }

    // Otherwise, fetch audience from Notion
    const pages = await fetchAllDatabasePages(databaseId, notionApiKey);
    const analytics = aggregateAnalytics(pages);

    let targetSubs = analytics.subscribers;
    if (audience && audience !== "All") {
      targetSubs = targetSubs.filter((s) => s.status === audience);
    }

    // Filter out invalid or duplicate emails
    const validEmails = Array.from(
      new Set(
        targetSubs
          .map((s) => s.email.trim().toLowerCase())
          .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      )
    );

    if (validEmails.length === 0) {
      return NextResponse.json(
        { error: `No valid subscriber emails found for audience: ${audience || "All"}` },
        { status: 400 }
      );
    }

    // Batch send in chunks of 50 (Resend batch API limit is 100)
    const chunkSize = 50;
    let sentCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < validEmails.length; i += chunkSize) {
      const chunk = validEmails.slice(i, i + chunkSize);
      const batchPayload = chunk.map((to) => ({
        from: fromEmail,
        to,
        subject: subject.trim(),
        html,
      }));

      const res = await resend.batch.send(batchPayload);
      if (res.error) {
        failCount += chunk.length;
        errors.push(res.error.message);
      } else if (res.data) {
        sentCount += chunk.length;
      }
    }

    return NextResponse.json({
      ok: true,
      recipientCount: validEmails.length,
      sentCount,
      failCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `Broadcast completed: ${sentCount} sent, ${failCount} failed.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Broadcast route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}