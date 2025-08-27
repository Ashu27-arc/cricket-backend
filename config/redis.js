// config/redis.js
// Redis disabled - running without caching

let redisClient = null;

async function connectRedis() {
    console.log('Redis caching disabled - running without cache');
    return null;
}

function getRedisClient() {
    return null;
}

module.exports = { connectRedis, getRedisClient };