import { Worker } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { sendOutreachEmail } from '../email/sender.js';
import { enqueueFollowUp } from './queues.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * startOutreachWorker()
 * 
 * Consumes 'guma:outreach' jobs.
 * Expected data: { businessId, publicUrl }
 */
export function startOutreachWorker() {
  const worker = new Worker(
    'guma:outreach',
    async (job) => {
      const { businessId, publicUrl } = job.data;

      // 1. Fetch the business to get the name and email address
      const { data: business, error: busError } = await supabase
        .from('businesses')
        .select(`
          name, 
          email, 
          raw_data,
          websites (
            lead_score
          )
        `)
        .eq('id', businessId)
        .single();

      if (busError || !business) {
        throw new Error(`Business ${businessId} not found: ${busError?.message}`);
      }

      if (!business.email) {
        console.warn(`Business "${business.name}" has no email. Skipping outreach.`);
        return;
      }

      const rating = business.raw_data?.rating;
      const leadScore = business.websites?.[0]?.lead_score || 0;

      // 2. Send the email using Resend and the Supabase Storage URL
      try {
        await sendOutreachEmail({
          to: business.email,
          businessName: business.name,
          previewUrl: publicUrl,
          rating,
          leadScore,
        });

        // 3. Mark outreach as sent in the database
        await supabase
          .from('websites')
          .update({ outreach_sent_at: new Date().toISOString() })
          .eq('business_id', businessId);

        // 4. Schedule the 72h follow-up
        await enqueueFollowUp(businessId);

      } catch (err) {
        console.error(`Failed to send outreach to ${business.email}:`, err.message);
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