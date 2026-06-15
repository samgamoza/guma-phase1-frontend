import { Worker } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { sendFollowUpEmail } from '../email/sender.js';
import { logger } from '../utils/logger.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export function startFollowUpWorker() {
  return new Worker('guma-followup', async (job) => {
    const { outreachId } = job.data; // outreachId is the businessId here

    // 1. Fetch business status and storage URL
    const { data: business, error } = await supabase
      .from('businesses')
      .select('name, email, is_claimed, websites(public_url)')
      .eq('id', outreachId)
      .single();

    if (error || !business) {
      throw new Error(`Follow-up: Business ${outreachId} not found`);
    }

    // 2. BREAKPOINT: If already claimed, do nothing
    if (business.is_claimed) {
      logger.info(`Business "${business.name}" already claimed. Skipping follow-up.`);
      return;
    }

    const publicUrl = business.websites?.[0]?.public_url;
    if (!publicUrl) {
      logger.warn(`No website found for ${business.name}. Cannot follow up.`);
      return;
    }

    // 3. Send the follow-up
    try {
      await sendFollowUpEmail({
        to: business.email,
        businessName: business.name,
        previewUrl: publicUrl,
      });
      
      logger.info(`Follow-up sent successfully to ${business.email}`);
    } catch (err) {
      logger.error(`Follow-up failed for ${business.email}`, err);
      throw err;
    }
  }, {
    connection: { url: process.env.REDIS_URL },
    concurrency: 1 // Slower rate for follow-ups
  });
}