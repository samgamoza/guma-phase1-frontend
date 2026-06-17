import { Worker } from 'bullmq';
import { sendFollowUpEmail } from '../email/sender.js';
import { logger } from '../utils/logger.js';
import { getSupabase } from '../db/client.js';

export function startFollowUpWorker() {
  return new Worker('guma-followup', async (job) => {
    const { outreachId } = job.data;
    if (!outreachId) {
      throw new Error('Follow-up worker job missing outreachId');
    }

    // 1. Fetch outreach record, business, and website
    const { data: outreach, error } = await getSupabase()
      .from('outreach')
      .select(`
        id,
        to_email,
        status,
        businesses (
          name,
          email
        ),
        websites (
          slug,
          claimed_by,
          status
        )
      `)
      .eq('id', outreachId)
      .single();

    if (error || !outreach) {
      throw new Error(`Follow-up: Outreach record ${outreachId} not found`);
    }

    const business = outreach.businesses;
    const website = outreach.websites;

    if (!business) {
      throw new Error(`Business not found for outreach record ${outreachId}`);
    }

    // 2. BREAKPOINT: If already claimed, do nothing
    const isClaimed = website?.claimed_by || website?.status === 'claimed' || website?.status === 'published' || outreach.status === 'claimed';
    if (isClaimed) {
      logger.info(`Outreach "${outreachId}" already claimed. Skipping follow-up.`);
      return;
    }

    const targetEmail = outreach.to_email || business.email;
    const slug = website?.slug;
    if (!targetEmail || !slug) {
      logger.warn(`No email or website slug found for outreach ${outreachId}. Cannot follow up.`);
      return;
    }

    const siteBase = process.env.SITE_BASE_URL || 'https://guma.ai';
    const publicUrl = `${siteBase}/sites/${slug}`;

    // 3. Send the follow-up
    try {
      await sendFollowUpEmail({
        to: targetEmail,
        businessName: business.name,
        previewUrl: publicUrl,
      });
      
      logger.info(`Follow-up sent successfully to ${targetEmail}`);
    } catch (err) {
      logger.error(`Follow-up failed for ${targetEmail}`, err);
      throw err;
    }
  }, {
    connection: { url: process.env.REDIS_URL },
    concurrency: 1 // Slower rate for follow-ups
  });
}