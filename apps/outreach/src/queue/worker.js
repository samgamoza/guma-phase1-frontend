import { Worker } from 'bullmq';
import { sendOutreachEmail } from '../email/sender.js';
import { enqueueFollowUp } from './queues.js';
import { getSupabase, updateOutreachStatus, getSentTodayCount } from '../db/client.js';

const DAILY_SEND_LIMIT = parseInt(process.env.DAILY_SEND_LIMIT || '200', 10);

function calculateLeadScore(business) {
  let score = 0;
  const rd = business.raw_data || {};
  const reviews = parseInt(rd.review_count || 0);
  if (reviews >= 200) score += 40;
  else if (reviews >= 100) score += 30;
  else if (reviews >= 20) score += 15;

  const rating = parseFloat(rd.rating || 0);
  if (rating >= 4.5) score += 20;
  else if (rating >= 4.0) score += 10;

  if (business.email) score += 20;
  if (business.phone) score += 10;

  const hasSocial = rd.social_links && Object.keys(rd.social_links).length > 0;
  const hasServices = rd.services && rd.services.length > 0;
  if (hasSocial) score += 5;
  if (hasServices) score += 5;

  return Math.min(100, score);
}

/**
 * startOutreachWorker()
 * 
 * Consumes 'guma-outreach' jobs.
 * Expected data: { outreachId }
 */
export function startOutreachWorker() {
  const worker = new Worker(
    'guma-outreach',
    async (job) => {
      const { outreachId } = job.data;
      if (!outreachId) {
        throw new Error('Outreach worker job missing outreachId');
      }

      // 1. Fetch the outreach record, business, and website
      const { data: outreach, error: outError } = await getSupabase()
        .from('outreach')
        .select(`
          id,
          to_email,
          businesses (
            id,
            name,
            email,
            raw_data
          ),
          websites (
            id,
            slug
          )
        `)
        .eq('id', outreachId)
        .single();

      if (outError || !outreach) {
        throw new Error(`Outreach record ${outreachId} not found: ${outError?.message}`);
      }

      const business = outreach.businesses;
      const website = outreach.websites;

      if (!business) {
        throw new Error(`Business not found for outreach record ${outreachId}`);
      }

      const targetEmail = outreach.to_email || business.email;
      if (!targetEmail) {
        console.warn(`Business "${business.name}" has no email. Skipping outreach.`);
        await updateOutreachStatus(outreachId, 'failed');
        return;
      }

      // Enforce daily send cap to protect email reputation
      const sentToday = await getSentTodayCount();
      if (sentToday >= DAILY_SEND_LIMIT) {
        console.warn(`Daily send limit reached (${sentToday}/${DAILY_SEND_LIMIT}). Releasing job back to queue.`);
        // Throw so BullMQ retries later (next day workers will pick it up)
        throw new Error(`DAILY_LIMIT_REACHED: ${sentToday}/${DAILY_SEND_LIMIT}`);
      }

      const rating = business.raw_data?.rating;
      const leadScore = calculateLeadScore(business);
      const siteBase = process.env.SITE_BASE_URL || 'https://guma.ai';
      const publicUrl = website?.slug ? `${siteBase}/sites/${website.slug}` : '';

      // 2. Send the email using Resend
      try {
        await sendOutreachEmail({
          to: targetEmail,
          businessName: business.name,
          previewUrl: publicUrl,
          rating,
          leadScore,
        });

        // 3. Mark outreach as sent in the database
        await updateOutreachStatus(outreachId, 'sent');

        // 4. Schedule the 72h follow-up
        await enqueueFollowUp(outreachId);

      } catch (err) {
        console.error(`Failed to send outreach to ${targetEmail}:`, err.message);
        await updateOutreachStatus(outreachId, 'failed');
        throw err; // Re-throw to trigger BullMQ retry logic
      }
    },
    {
      connection: { url: process.env.REDIS_URL },
      // Concurrency limit to protect your email reputation
      concurrency: 2,
    }
  );

  return worker;
}