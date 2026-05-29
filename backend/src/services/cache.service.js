import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
});

redisClient.on("error", (error) => {
  console.error("Error Redis:", error.message);
});

await redisClient.connect();

export async function getCache(key) {
  console.log("Buscando cache:", key);

  const data = await redisClient.get(key);

  if (data) {
    console.log("CACHE HIT:", key);
    return JSON.parse(data);
  }

  console.log("CACHE MISS:", key);
  return null;
}

export async function setCache(key, value, ttl = 60) {
  await redisClient.setEx(
    key,
    ttl,
    JSON.stringify(value)
  );

  console.log("CACHE SET:", key);
}

export default redisClient;