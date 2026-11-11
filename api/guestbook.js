const crypto = require("crypto");
const { hasRedis, redis } = require("./_redis.js");
const seed = require("../data/guestbook.json");

const NOTES_KEY = "guestbook:notes";

const SEED_EDITS_KEY = "guestbook:seed-edits";
const SEED_HIDDEN_KEY = "guestbook:seed-hidden";
const SEED_IDS = new Set(seed.notes.map((n) => n.id));
const MAX_LENGTH = 300;
const MAX_NAME = 30;
const RATE_LIMIT = 5;
const RATE_WINDOW = 10 * 60;

function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"] || "";
  return forwarded.split(",")[0].trim() || req.socket?.remoteAddress || "";
}

function cleanText(text) {
  return String(text || "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

function pairsToObject(list) {
  const out = {};
  for (let i = 0; i < (list || []).length; i += 2) out[list[i]] = list[i + 1];
  return out;
}

async function listNotes() {
  let seedNotes = seed.notes;
  let stored = [];
  if (hasRedis()) {
    const [values, edits, hidden] = await Promise.all([
      redis(["HVALS", NOTES_KEY]),
      redis(["HGETALL", SEED_EDITS_KEY]),
      redis(["SMEMBERS", SEED_HIDDEN_KEY]),
    ]);
    stored = (values || []).map((json) => JSON.parse(json));
    const editsById = pairsToObject(edits);
    const hiddenIds = new Set(hidden || []);
    seedNotes = seed.notes
      .filter((n) => !hiddenIds.has(n.id))
      .map((n) =>
        editsById[n.id] ? { ...n, ...JSON.parse(editsById[n.id]) } : n,
      );
  }
  const notes = [...seedNotes, ...stored];
  notes.sort((a, b) => new Date(a.date) - new Date(b.date));
  return notes;
}

async function addNote(req, res) {
  if (!hasRedis()) {
    return res
      .status(503)
      .json({ error: "The guestbook isn't set up for new notes yet." });
  }

  const body =
    typeof req.body === "string"
      ? JSON.parse(req.body || "{}")
      : req.body || {};
  const text = cleanText(body.text);
  const x = Number(body.x);
  const y = Number(body.y);
  const token = String(body.token || "");
  const name = cleanText(body.name).replace(/\s+/g, " ");

  if (!text) return res.status(400).json({ error: "The note is empty." });
  if (!name) return res.status(400).json({ error: "Please add your name." });
  if ([...name].length > MAX_NAME) {
    return res
      .status(400)
      .json({ error: `Names can be up to ${MAX_NAME} characters.` });
  }
  if ([...text].length > MAX_LENGTH) {
    return res
      .status(400)
      .json({ error: `Notes can be up to ${MAX_LENGTH} characters.` });
  }
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return res.status(400).json({ error: "Bad position." });
  }
  if (!/^[A-Za-z0-9-]{20,100}$/.test(token)) {
    return res.status(400).json({ error: "Bad token." });
  }

  const rateKey = `guestbook:rate:${sha256(`guestbook-rate:${clientIp(req)}`).slice(0, 24)}`;
  const count = await redis(["INCR", rateKey]);
  if (count === 1) await redis(["EXPIRE", rateKey, String(RATE_WINDOW)]);
  if (count > RATE_LIMIT) {
    return res
      .status(429)
      .json({ error: "That's a lot of notes! Try again in a few minutes." });
  }

  const note = {
    id: `n-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`,
    text,
    name,
    date: new Date().toISOString(),
    author: sha256(`guestbook-author:${token}`).slice(0, 16),
    x: Math.round(Math.min(Math.max(x, 0), seed.board.width - 40)),
    y: Math.round(Math.min(Math.max(y, 0), seed.board.height - 30)),
  };

  await redis(["HSET", NOTES_KEY, note.id, JSON.stringify(note)]);
  return res.status(201).json({ note });
}

function isAdmin(req) {
  const adminKey = process.env.GUESTBOOK_ADMIN_KEY;
  return Boolean(adminKey) && req.headers["x-admin-key"] === adminKey;
}

async function editNote(req, res) {
  if (!isAdmin(req)) return res.status(403).json({ error: "Not allowed." });
  if (!hasRedis())
    return res.status(503).json({ error: "Database not connected." });

  const id = String((req.query && req.query.id) || "");
  const body =
    typeof req.body === "string"
      ? JSON.parse(req.body || "{}")
      : req.body || {};
  const text = cleanText(body.text);
  if (!text) return res.status(400).json({ error: "Text can't be empty." });

  if (SEED_IDS.has(id)) {
    const original = seed.notes.find((n) => n.id === id);
    const name =
      body.name === undefined ? original.name : String(body.name).trim();
    await redis(["HSET", SEED_EDITS_KEY, id, JSON.stringify({ text, name })]);
    return res.status(200).json({ note: { ...original, text, name } });
  }

  const json = await redis(["HGET", NOTES_KEY, id]);
  if (!json) return res.status(404).json({ error: "No note with that id." });
  const note = { ...JSON.parse(json), text };
  await redis(["HSET", NOTES_KEY, id, JSON.stringify(note)]);
  return res.status(200).json({ note });
}

async function removeNote(req, res) {
  if (!isAdmin(req)) return res.status(403).json({ error: "Not allowed." });
  if (!hasRedis())
    return res.status(503).json({ error: "Database not connected." });
  const id = String((req.query && req.query.id) || "");
  if (!id) return res.status(400).json({ error: "Missing id." });

  if (SEED_IDS.has(id)) {
    await redis(["SADD", SEED_HIDDEN_KEY, id]);
    return res.status(200).json({ removed: true });
  }
  const removed = await redis(["HDEL", NOTES_KEY, id]);
  return res.status(200).json({ removed: removed === 1 });
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        board: seed.board,
        notes: await listNotes(),
        canPost: hasRedis(),
      });
    }
    if (req.method === "POST") return await addNote(req, res);
    if (req.method === "PATCH") return await editNote(req, res);
    if (req.method === "DELETE") return await removeNote(req, res);
    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong." });
  }
};
