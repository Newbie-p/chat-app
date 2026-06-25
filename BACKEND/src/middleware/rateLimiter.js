import redis from "../config/redis.js";

const WINDOW_SECONDS = 10
const MAX_MESSAGES = 5 // 5 mesg per 10 sec per user 

export const messageLimiter = async(Socket, next)=>{
    try{
        const key = `chat:rate_limit:${Socket.userId}`

        const count = await redis.incr(key)

        if(count === 1){
            await redis.expire(key, WINDOW_SECONDS)
        }

        if(count > MAX_MESSAGES){
            const ttl = await redis.ttl(key)
            Socket.emit('error', {
                message: `Too many messages. Wait ${ttl} seconds.`
            })
            return
        }
        next()
    }catch(err){
        console.error('Rate  limiter error:', err.message)
        next()
    }
}