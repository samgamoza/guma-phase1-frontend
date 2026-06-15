import { Queue, QueueEvents } from 'bullmq'
import { logger } from '../utils/logger.js'

const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' }

/**
 * outreachQueue — one job per outreach record
 * Job data: { outreachId: string }
 */
export const outreachQueue = new Queue('guma-outreach', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30_000 },
    removeOnComplete: { count: 500 },
    removeOnFail:     { count: 200 },
  },
})

/**
 * followUpQueue — scheduled follow-up emails (72h after initial send)
 * Job data: { outreachId: string }
 */
export const followUpQueue = new Queue('guma-followup', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 60_000 },
    removeOnComplete: { count: 500 },
    removeOnFail:     { count: 200 },
  },
})

export async function enqueueOutreachJob(outreachId) {
  const job = await outreachQueue.add(
    `outreach:${outreachId}`,
    { outreachId },
    { jobId: `outreach-${outreachId}` }
  )
  logger.debug(`Queued outreach job: ${outreachId}`)
  return job
}

export async function enqueueFollowUp(outreachId, delayMs = 72 * 60 * 60 * 1000) {
  const job = await followUpQueue.add(
    `followup:${outreachId}`,
    { outreachId },
    { jobId: `followup-${outreachId}`, delay: delayMs }
  )
  logger.debug(`Queued follow-up (${Math.round(delayMs / 3600000)}h delay): ${outreachId}`)
  return job
}

export function attachQueueLogging() {
  const ev = new QueueEvents('guma-outreach', { connection })
  ev.on('completed', ({ jobId }) => logger.info(`Outreach job done: ${jobId}`))
  ev.on('failed',    ({ jobId, failedReason }) =>
    logger.error(`Outreach job failed: ${jobId}`, { reason: failedReason })
  )
}
