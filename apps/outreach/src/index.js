import 'dotenv/config'
import { startOutreachWorker } from './queue/worker.js'
import { startFollowUpWorker } from './queue/followup-worker.js'
import { attachQueueLogging } from './queue/queues.js'

const outreachWorker = startOutreachWorker()
const followUpWorker = startFollowUpWorker()
attachQueueLogging()

console.log('Outreach workers started (concurrency: outreach=2, followup=1)')

async function shutdown() {
  console.log('Shutting down outreach workers...')
  await outreachWorker.close()
  await followUpWorker.close()
  process.exit(0)
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
