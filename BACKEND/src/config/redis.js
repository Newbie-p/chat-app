import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Quick connection test
redis.ping().then((res) => {
  console.log('Redis connected ✅', res) // should print "PONG"
}).catch((err) => {
  console.error('Redis connection failed ❌', err.message)
})

export default redis