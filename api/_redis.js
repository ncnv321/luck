function findEnv(suffix) {
  const preferred = [
    `KV_${suffix}`,
    `STORAGE_${suffix}`,
    `UPSTASH_REDIS_${suffix.replace("API_", "")}`,
  ];
  for (const name of preferred) {
    if (process.env[name]) return process.env[name];
  }
  const any = Object.keys(process.env).find((name) =>
    name.endsWith(`_${suffix}`),
  );
  return any ? process.env[any] : undefined;
}

const REDIS_URL = findEnv("REST_API_URL");
const REDIS_TOKEN = findEnv("REST_API_TOKEN");

function hasRedis() {
  return Boolean(REDIS_URL && REDIS_TOKEN);
}

async function redis(command) {
  const response = await fetch(REDIS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error(`Redis returned ${response.status}`);
  return (await response.json()).result;
}

module.exports = { hasRedis, redis };
