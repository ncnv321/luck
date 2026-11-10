const NEOCITIES_INFO = "https://neocities.org/api/info?sitename=lluck";
const LATEST_COMMIT =
  "https://api.github.com/repos/ncnv321/luck/commits?sha=main&per_page=1";
const COUNTER_KEY = "luck:visitors";

const { hasRedis, redis } = require("./_redis.js");

const cache = { lastUpdated: null, lastUpdatedAt: 0, neocitiesViews: null };
const TEN_MINUTES = 10 * 60 * 1000;

async function getNeocitiesViews() {
  if (cache.neocitiesViews !== null) return cache.neocitiesViews;
  const response = await fetch(NEOCITIES_INFO);
  if (!response.ok) throw new Error(`Neocities returned ${response.status}`);
  const data = await response.json();
  cache.neocitiesViews = Number(data.info.views) || 0;
  return cache.neocitiesViews;
}

async function getLastUpdated() {
  if (cache.lastUpdated && Date.now() - cache.lastUpdatedAt < TEN_MINUTES) {
    return cache.lastUpdated;
  }
  const headers = { "User-Agent": "luck-site-stats" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const response = await fetch(LATEST_COMMIT, { headers });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  const [commit] = await response.json();
  cache.lastUpdated = commit.commit.committer.date;
  cache.lastUpdatedAt = Date.now();
  return cache.lastUpdated;
}

async function getViews(countThisVisit) {
  if (!hasRedis()) {
    return { views: await getNeocitiesViews(), counting: false };
  }

  const exists = await redis(["EXISTS", COUNTER_KEY]);
  if (!exists) {
    const start = await getNeocitiesViews();
    await redis(["SET", COUNTER_KEY, String(start), "NX"]);
  }
  const views = countThisVisit
    ? await redis(["INCR", COUNTER_KEY])
    : await redis(["GET", COUNTER_KEY]);
  return { views: Number(views), counting: true };
}

module.exports = async (req, res) => {
  const countThisVisit = req.query && req.query.hit === "1";

  const [viewsResult, lastUpdatedResult] = await Promise.allSettled([
    getViews(countThisVisit),
    getLastUpdated(),
  ]);

  if (viewsResult.status === "rejected") console.error(viewsResult.reason);
  if (lastUpdatedResult.status === "rejected") {
    console.error(lastUpdatedResult.reason);
  }

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    views: viewsResult.status === "fulfilled" ? viewsResult.value.views : null,
    counting:
      viewsResult.status === "fulfilled" ? viewsResult.value.counting : false,
    lastUpdated:
      lastUpdatedResult.status === "fulfilled" ? lastUpdatedResult.value : null,
  });
};
