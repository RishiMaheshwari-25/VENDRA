import Redis from "ioredis";
import {config} from "../config/config.js";
const redis=new Redis({
    host:config.REDIS_HOST,
    port:config.REDIS_PORT,
    password:config.REDIS_PASSWORD,
    ...(config.REDIS_TLS ? { tls: {} } : {})
})

redis.on("connect",()=>{
    console.log("Redis connected with Server")
})
redis.on("error",(err)=>{
    console.log(err)
})
export default redis;