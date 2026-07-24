import { Queue} from 'bullmq'
import { redisConnection } from '../cache/redis.client'

export const ingestionQueue = new Queue("ingestion", {
    connection: redisConnection,
})