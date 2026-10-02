import {Queue,Worker} from "bullmq"; import IORedis from "ioredis";
const connection=new IORedis(process.env.REDIS_URL??"redis://localhost:6379",{maxRetriesPerRequest:null}); const queue=new Queue("ctp-alpha",{connection});
new Worker("ctp-alpha",async job=>{console.log(`[worker] processing ${job.name}`,job.data);return {ok:true,processedAt:new Date().toISOString()}},{connection,concurrency:1});
await queue.add("heartbeat",{source:"ctp-alpha-worker"},{removeOnComplete:100}); console.log("CTP Alpha Worker online");