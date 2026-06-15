/**
 * buildOutreachTemplate()
 * 
 * Generates the subject and HTML body for the cold email.
 */
export function buildOutreachTemplate({ businessName, previewUrl, rating, leadScore }) {
  const highRatingMention = (leadScore > 70 && rating)
    ? `<p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
         I was particularly impressed by your <strong>${rating} star rating</strong> online — it's clear that your customers really value your service!
       </p>`
    : '';

  return {
    subject: `I built a new website for ${businessName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; padding: 20px;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Hello!</h1>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          I'm from Guma AI. I've been researching local businesses in your area and noticed your online presence. 
          I took the liberty of generating a brand-new, modern site for <strong>${businessName}</strong>.
        </p>
        
        ${highRatingMention}

        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">Click the button below to view your personalized site preview:</p>
          <a href="${previewUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 16px;">
            View My Website Preview →
          </a>
        </div>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          This site was built automatically using our AI engine. If you like it, you can <strong>claim it for free</strong>, 
          connect your own domain, and start using it today.
        </p>

        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 40px;">
          Best regards,<br>
          The Guma AI Team
        </p>

        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          Sent with ❤️ by Guma AI. <br />
          If you didn't expect this, you can safely ignore this email.
        </p>
      </div>
    `
  };
}

/**
 * buildFollowUpTemplate()
 * 
 * A softer follow-up template sent 72h later.
 */
export function buildFollowUpTemplate({ businessName, previewUrl }) {
  return {
    subject: `Checking in: Your new website for ${businessName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <p>Hi again,</p>
        <p>I wanted to quickly follow up on the modern website I built for <strong>${businessName}</strong> a few days ago.</p>
        
        <p>In case you missed it, you can view the live preview here:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${previewUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">View Site Preview</a>
        </p>

        <p>If you're happy with it, you can claim the site and it's yours to keep. If you have any questions about how to customize it, just let me know.</p>

        <p>Best,<br>Jake from Guma AI</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 40px;" />
        <p style="font-size: 11px; color: #666; text-align: center;">
          Guma AI - Modern web presence for local business.<br>
          If you've already claimed your site, please disregard this message.
        </p>
      </div>
    `
  };
}