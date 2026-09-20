const http = require("http");
const fs = require("fs");
const path = require("path");
const { stores, puzzles, artists } = require("./data/catalog");

const PORT = process.env.PORT || 3847;
const PUBLIC = path.join(__dirname, "public");

const state = {
  redemptions: {},
  codes: new Map()
};

function json(res, code, body) {
  const data = JSON.stringify(body);
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store"
  });
  res.end(data);
}

function makeCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

function storeById(id) {
  return stores.find((s) => s.id.toLowerCase() === String(id || "").toLowerCase());
}

function weeklyPuzzle() {
  return puzzles[0];
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  if (/^\/s\/[^/]+\/?$/.test(urlPath)) urlPath = "/s/index.html";
  if (urlPath.endsWith("/")) urlPath += "index.html";

  const file = path.normalize(path.join(PUBLIC, urlPath));
  if (!file.startsWith(PUBLIC)) {
    res.writeHead(403);
    return res.end("forbidden");
  }
  const ext = path.extname(file);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
    ".json": "application/json"
  };
  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("not found");
    }
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(buf);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = url.pathname;
  const method = req.method;

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    });
    return res.end();
  }

  if (route === "/api/health") {
    return json(res, 200, { ok: true, apps: ["trickbag", "bagtunes"] });
  }

  if (route === "/api/stores" && method === "GET") {
    return json(res, 200, { stores });
  }

  if (route.startsWith("/api/stores/") && method === "GET") {
    const id = route.split("/")[3];
    const store = storeById(id);
    if (!store) return json(res, 404, { error: "Unknown store" });
    const used = state.redemptions[store.id] || 0;
    return json(res, 200, {
      store,
      treatsLeft: Math.max(0, store.treatCapWeek - used),
      puzzle: weeklyPuzzle(),
      artists: artists.filter((a) => a.stores.includes(store.id))
    });
  }

  if (route === "/api/puzzle/check" && method === "POST") {
    const body = await parseBody(req);
    const puzzle = puzzles.find((p) => p.id === body.puzzleId) || weeklyPuzzle();
    const correct = String(body.answer || "").trim() === puzzle.answer;
    return json(res, 200, { correct, hint: correct ? null : puzzle.hint });
  }

  if (route === "/api/unlock" && method === "POST") {
    const body = await parseBody(req);
    const store = storeById(body.storeId);
    if (!store) return json(res, 400, { error: "Unknown store" });
    const used = state.redemptions[store.id] || 0;
    const treatsLeft = Math.max(0, store.treatCapWeek - used);
    const code = makeCode();
    const token = `bt_${store.id}_${Date.now().toString(36)}`;
    state.codes.set(code, {
      storeId: store.id,
      token,
      created: Date.now(),
      expires: Date.now() + 2 * 60 * 60 * 1000,
      used: false
    });
    return json(res, 200, {
      code,
      token,
      treat: store.treat,
      treatsLeft,
      bagtunesUrl: `/bagtunes/?store=${encodeURIComponent(store.id)}&unlock=${encodeURIComponent(token)}`,
      expiresInMinutes: 120
    });
  }

  if (route === "/api/redeem" && method === "POST") {
    const body = await parseBody(req);
    const code = String(body.code || "").trim().toUpperCase();
    const entry = state.codes.get(code);
    if (!entry) return json(res, 404, { ok: false, error: "Code not found" });
    if (entry.used) return json(res, 409, { ok: false, error: "Already used" });
    if (Date.now() > entry.expires) return json(res, 410, { ok: false, error: "Expired" });
    const store = storeById(body.storeId || entry.storeId);
    if (!store || store.id !== entry.storeId) {
      return json(res, 400, { ok: false, error: "Wrong store" });
    }
    const used = state.redemptions[store.id] || 0;
    if (used >= store.treatCapWeek) {
      return json(res, 429, { ok: false, error: "Weekly cap hit" });
    }
    entry.used = true;
    state.redemptions[store.id] = used + 1;
    return json(res, 200, {
      ok: true,
      treat: store.treat,
      store: store.name,
      remaining: store.treatCapWeek - used - 1
    });
  }

  if (route === "/api/bagtunes/unlock" && method === "GET") {
    const token = url.searchParams.get("unlock") || "";
    const storeId = url.searchParams.get("store") || "";
    const store = storeById(storeId);
    const valid = token.startsWith("bt_") && store;
    return json(res, 200, {
      unlocked: Boolean(valid),
      store: store || null,
      artists: store ? artists.filter((a) => a.stores.includes(store.id)) : artists
    });
  }

  serveStatic(req, res);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Bagverse on http://localhost:${PORT}`);
  console.log(`  TrickBag  http://localhost:${PORT}/trickbag/`);
  console.log(`  Bagtunes  http://localhost:${PORT}/bagtunes/`);
});
