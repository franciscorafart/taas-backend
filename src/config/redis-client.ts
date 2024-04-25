import { createClient, RedisClientType } from "redis";

const client: RedisClientType = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  },
  password: process.env.REDIS_PASSWORD,
});

// NOTE: Client initialized on index.ts file. redisClient is used in different files,
// but it has to be initialized first by running the express app, inidividual tests, or supertest

export default client;
