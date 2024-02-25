const { createClient } = require('redis');

const client = createClient(
    {
    password: process.env.REDIS_KEY,
    socket: {
        host: 'redis-14511.c326.us-east-1-3.ec2.cloud.redislabs.com',
        port: 14511
    }
}
);

function connectToRedis()
{
    client.connect();
    console.log('Redis connected')
}

module.exports = {client,connectToRedis}