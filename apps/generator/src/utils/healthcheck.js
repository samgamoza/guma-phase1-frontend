import Redis from 'ioredis'

export async function assertHealthy() {
  const errors = []

  // Check Redis
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  try {
    const redis = new Redis(redisUrl, { lazyConnect: true, connectTimeout: 5000 })
    await redis.connect()
    await redis.ping()
    redis.disconnect()
  } catch (err) {
    errors.push(`Redis unreachable at ${redisUrl}: ${err.message}`)
  }

  // Check Supabase via REST (no WebSocket needed)
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) {
    errors.push('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
  } else {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/businesses?select=id&limit=1`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) errors.push(`Supabase REST returned ${res.status}`)
    } catch (err) {
      errors.push(`Supabase unreachable: ${err.message}`)
    }
  }

  if (errors.length) {
    console.error('Health check failed:')
    errors.forEach(e => console.error(' •', e))
    process.exit(1)
  }

  console.log('Health check passed (Redis + Supabase reachable)')
}
