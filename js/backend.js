// Realtime backend. Firebase in production; a same-browser "local" mode (?local=1)
// for rehearsal and automated tests, where the presenter tab acts as the server.

const FIREBASE_VERSION = "10.12.2";
const TS_SENTINEL = { ".sv": "timestamp" };

export function backendMode() {
  const p = new URLSearchParams(location.search);
  if (p.has("local")) return "local";
  const c = window.FIREBASE_CONFIG;
  return c && c.apiKey && c.databaseURL ? "firebase" : "unconfigured";
}

export async function createBackend(role) {
  const mode = backendMode();
  if (mode === "firebase") return createFirebase();
  if (mode === "local") return createLocal(role);
  throw Object.assign(new Error("Firebase is not configured yet (js/config.js)."), { code: "unconfigured" });
}

/* ---------------- Firebase ---------------- */
async function createFirebase() {
  const base = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
  const [appM, authM, dbM] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-auth.js`),
    import(`${base}/firebase-database.js`),
  ]);
  const app = appM.initializeApp(window.FIREBASE_CONFIG);
  const auth = authM.getAuth(app);
  const cred = await authM.signInAnonymously(auth);
  const db = dbM.getDatabase(app);
  let offset = 0;
  dbM.onValue(dbM.ref(db, ".info/serverTimeOffset"), s => { offset = s.val() || 0; });
  const r = p => dbM.ref(db, p);
  return {
    mode: "firebase",
    uid: cred.user.uid,
    TS: dbM.serverTimestamp(),
    now: () => Date.now() + offset,
    on: (path, cb) => dbM.onValue(r(path), s => cb(s.val())),
    onConnection: cb => dbM.onValue(r(".info/connected"), s => cb(!!s.val())),
    get: async path => (await dbM.get(r(path))).val(),
    set: (path, v) => dbM.set(r(path), v),
    update: (path, v) => dbM.update(r(path), v),
    remove: path => dbM.remove(r(path)),
    claim: async (path, v) => (await dbM.runTransaction(r(path), cur => (cur === null ? v : undefined))).committed,
    ready: Promise.resolve(),
  };
}

/* ---------------- Local (BroadcastChannel) ---------------- */
function split(path) { return path.split("/").filter(Boolean); }
function getAt(tree, path) {
  let t = tree;
  for (const k of split(path)) { if (t == null || typeof t !== "object") return null; t = t[k]; }
  return t === undefined ? null : t;
}
function prune(v) {
  if (v === null || v === undefined) return null;
  if (typeof v !== "object") return v;
  const o = {};
  for (const [k, x] of Object.entries(v)) { const p = prune(x); if (p !== null) o[k] = p; }
  return Object.keys(o).length ? o : null;
}
function setAt(tree, path, value) {
  const keys = split(path);
  if (!keys.length) return prune(value) || {};
  const root = tree || {};
  let t = root;
  keys.slice(0, -1).forEach(k => { if (typeof t[k] !== "object" || t[k] === null) t[k] = {}; t = t[k]; });
  t[keys[keys.length - 1]] = value;
  return prune(root) || {};
}
function resolveTS(v, now) {
  if (v && typeof v === "object") {
    if (v[".sv"] === "timestamp") return now;
    const o = Array.isArray(v) ? [] : {};
    for (const [k, x] of Object.entries(v)) o[k] = resolveTS(x, now);
    return o;
  }
  return v;
}

// Mirrors database.rules.json for the parts that matter to game logic.
function allowed(db, uid, path, value) {
  const k = split(path);
  if (k[0] !== "games" || !k[1]) return false;
  const g = db?.games?.[k[1]] || {};
  const isHost = g.host === uid;
  const sec = k[2];
  if (!sec) return false;
  if (sec === "host") return !g.host && value === uid;
  if (["state", "scores", "results", "meta"].includes(sec)) return isHost;
  if (sec === "players") return isHost || k[3] === uid;
  if (sec === "answers") {
    if (isHost) return true;
    const [q, who] = [k[3], k[4]];
    const st = g.state || {};
    return who === uid && k.length === 5 && !(g.answers?.[q]?.[who]) && st.phase === "open" && st.qid === q
      && Date.now() <= st.startedAt + st.dur + 2000;
  }
  return false;
}

function createLocal(role) {
  const ch = new BroadcastChannel("toxlive-local");
  const key = "toxlive-local-uid-" + role;
  let uid = sessionStorage.getItem(key);
  if (!uid) { uid = role + "_" + Math.random().toString(36).slice(2, 10); sessionStorage.setItem(key, uid); }
  const isServer = role === "host";
  let db = isServer ? JSON.parse(localStorage.getItem("toxlive-local-db") || "{}") : {};
  const listeners = new Set();
  const pending = new Map();
  let seq = 0;
  let markReady;
  const ready = new Promise(res => { markReady = res; setTimeout(res, 1500); });
  if (isServer) markReady();

  function emit() {
    for (const l of listeners) {
      const v = getAt(db, l.path);
      const s = JSON.stringify(v);
      if (s !== l.last) { l.last = s; l.cb(v === null ? null : JSON.parse(s)); }
    }
  }
  function apply(op, from) {
    const now = Date.now();
    if (op.kind === "claim") {
      if (getAt(db, op.path) !== null) return false;
      if (!allowed(db, from, op.path, op.value)) return false;
      db = setAt(db, op.path, op.value); return true;
    }
    const writes = op.kind === "update"
      ? Object.entries(op.value).map(([k, v]) => [op.path.replace(/\/$/, "") + "/" + k, v])
      : [[op.path, op.kind === "remove" ? null : op.value]];
    for (const [p, v] of writes) if (!allowed(db, from, p, resolveTS(v, now))) return false;
    for (const [p, v] of writes) db = setAt(db, p, resolveTS(v, now));
    return true;
  }
  function serverHandle(op, from) {
    const ok = apply(op, from);
    localStorage.setItem("toxlive-local-db", JSON.stringify(db));
    ch.postMessage({ t: "snap", db });
    emit();
    return ok;
  }
  ch.onmessage = e => {
    const m = e.data;
    if (isServer && m.t === "op") { const ok = serverHandle(m.op, m.from); ch.postMessage({ t: "ack", id: m.id, to: m.from, ok }); }
    if (isServer && m.t === "hello") ch.postMessage({ t: "snap", db });
    if (!isServer && m.t === "snap") { db = m.db || {}; markReady(); emit(); }
    if (!isServer && m.t === "ack" && m.to === uid && pending.has(m.id)) { pending.get(m.id)(m.ok); pending.delete(m.id); }
  };
  if (!isServer) ch.postMessage({ t: "hello" });

  function send(op) {
    if (isServer) { const ok = serverHandle(op, uid); return ok ? Promise.resolve(true) : Promise.reject(new Error("PERMISSION_DENIED")); }
    const id = uid + ":" + (++seq);
    return new Promise((res, rej) => {
      pending.set(id, ok => (ok ? res(true) : rej(new Error("PERMISSION_DENIED"))));
      ch.postMessage({ t: "op", id, from: uid, op });
      setTimeout(() => { if (pending.has(id)) { pending.delete(id); rej(new Error("No presenter tab is open")); } }, 4000);
    });
  }
  return {
    mode: "local", uid, TS: TS_SENTINEL, ready,
    now: () => Date.now(),
    on(path, cb) { const l = { path, cb, last: undefined }; listeners.add(l); setTimeout(emit, 0); return () => listeners.delete(l); },
    onConnection(cb) { cb(true); return () => {}; },
    get: async path => { const v = getAt(db, path); return v === null ? null : JSON.parse(JSON.stringify(v)); },
    set: (path, value) => send({ kind: "set", path, value }),
    update: (path, value) => send({ kind: "update", path, value }),
    remove: path => send({ kind: "remove", path }),
    claim: (path, value) => isServer ? Promise.resolve(serverHandle({ kind: "claim", path, value }, uid))
      : send({ kind: "claim", path, value }).catch(() => false),
  };
}
