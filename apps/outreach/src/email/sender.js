import { Resend } from 'resend';
import { buildOutreachTemplate, buildFollowUpTemplate } from './templates.js';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * sendOutreachEmail()
 * 
 * Uses Resend to deliver a personalized email to the business owner.
 */
export async function sendOutreachEmail({ to, businessName, previewUrl, rating, leadScore }) {
  if (!to) throw new Error('Recipient email is required for outreach');

  const { subject, html } = buildOutreachTemplate({ businessName, previewUrl, rating, leadScore });

  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || 'Guma AI <hello@guma.ai>',
    to: [to],
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend API failed: ${error.message}`);
  }

  return data;
}

export async function sendFollowUpEmail({ to, businessName, previewUrl }) {
  if (!to) return;

  const { subject, html } = buildFollowUpTemplate({ businessName, previewUrl });

  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || 'Guma AI <hello@guma.ai>',
    to: [to],
    subject,
    html,
  });

  if (error) throw new Error(`Follow-up failed: ${error.message}`);
  return data;
}