import { createBackend, backendMode } from "./backend.js?v=202610241638";
import { SLIDES, QUESTIONS, QUESTION_BY_ID, LETTERS, ROUND_MS, scoreFor, standings } from "./slides.js?v=202610241638";
import { REFERENCE_LIST } from "./refs.js?v=202610241638";
import { chipIdsFor, renderChips, closeCard, cardOpen, openCard } from "./evidence.js?v=202610241638";
import { REFS } from "./refs.js?v=202610241638";

const MODE = backendMode();
const SKEY = "toxlive-host-v1-" + MODE;
const OPT_CLASS = ["opt-a", "opt-b", "opt-c", "opt-d"];
const DUR = (Number(new URLSearchParams(location.search).get("dur")) || ROUND_MS / 1000) * 1000; // ?dur=20 for 20-second rounds
const BOT_NAMES = ["Atropine", "Fomepizole", "Glucagon", "Naloxone", "Physostigmine"];

const $ = s => document.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v;
    else if (k === "text") e.textContent = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k != null) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
};

let api, pin;
let idx = -1;                  // -1 = lobby
let rounds = {};               // qid -> "open" | "revealed" | "board"
let players = {}, scores = {}, results = {}, state = null, live = {};
let unsubLive = null, raf = null, revealing = false, showLive = true, botTimers = [];

/* ---------------- stage scaling ---------------- */
function fit() {
  const s = Math.min(innerWidth / 1600, innerHeight / 900);
  const st = $("#stage");
  st.style.transform = `scale(${s})`;
  st.style.left = `${(innerWidth - 1600 * s) / 2}px`;
  st.style.top = `${(innerHeight - 900 * s) / 2}px`;
}
addEventListener("resize", fit);
fit();

/* ---------------- boot ---------------- */
(async function boot() {
  try {
    api = await createBackend("host");
  } catch (e) {
    showSetup(e);
    return;
  }
  await startSession(false);
  api.on(`games/${pin}/players`, v => {
    players = v || {}; refreshCounts();
    if (idx === -1 || isFinal()) render();
    else if (SLIDES[idx]?.type === "question" && rounds[SLIDES[idx].id] === "open") updateLive(SLIDES[idx]);
  });
  api.on(`games/${pin}/scores`, v => { scores = v || {}; if (isFinal()) render(); });
  api.on(`games/${pin}/results`, v => { results = v || {}; });
  api.on(`games/${pin}/state`, v => { state = v; });
  api.onConnection(ok => { const c = $("#conn"); c.textContent = ok ? "" : "Reconnecting…"; c.className = ok ? "" : "conn-bad"; });
  const cur = SLIDES[idx];
  if (cur?.type === "question" && rounds[cur.id] === "open") resumeRound(cur);
  else await publishState();
  render();
})();

function showSetup(e) {
  document.body.classList.remove("host");
  document.body.style.overflow = "auto";
  document.body.replaceChildren(h("div", { class: "setup" },
    h("h1", { text: "One step left" }),
    h("p", { text: e.code === "unconfigured"
      ? "This copy of the site doesn't have its Firebase settings yet. Paste your Firebase web config into js/config.js and reload."
      : `The live game couldn't connect: ${e.message}` }),
    h("p", {}, "To rehearse on this computer without Firebase, open ", h("code", { text: "index.html?local=1" }), " and the join link it shows in another tab.")));
}

async function startSession(forceNew) {
  const saved = JSON.parse(localStorage.getItem(SKEY) || "null");
  if (!forceNew && saved?.pin && (await api.get(`games/${saved.pin}/host`)) === api.uid) {
    ({ pin } = saved); idx = saved.idx ?? -1; rounds = saved.rounds || {};
    return;
  }
  for (let i = 0; i < 25; i++) {
    const p = String(1000 + Math.floor(Math.random() * 9000));
    if (await api.claim(`games/${p}/host`, api.uid)) { pin = p; break; }
  }
  if (!pin) throw new Error("Could not create a game PIN");
  idx = -1; rounds = {};
  await api.set(`games/${pin}/meta`, { createdAt: api.TS });
  save();
}
function save() { localStorage.setItem(SKEY, JSON.stringify({ pin, idx, rounds })); }

function joinURL() {
  const u = new URL("play.html", location.href);
  u.search = "";
  u.searchParams.set("g", pin);
  if (MODE === "local") u.searchParams.set("local", "1");
  return u.toString();
}
function shortJoin() {
  const u = new URL("play.html", location.href);
  return (u.host + u.pathname).replace(/\/play\.html$/, "/play");
}

/* ---------------- navigation ---------------- */
const isFinal = () => SLIDES[idx]?.type === "final";

async function next() {
  if (closeOverlays()) return;
  if (idx === -1) return go(0);
  const s = SLIDES[idx];
  if (s.type === "question") {
    const st = rounds[s.id];
    if (!st) return openRound(s);
    if (st === "open") return reveal(s);
    if (st === "revealed") return showBoard(s);
  }
  if (idx < SLIDES.length - 1) go(idx + 1);
}
function prev() {
  if (closeOverlays()) return;
  const s = SLIDES[idx];
  if (s?.type === "question" && rounds[s.id] === "open") return; // finish the round first
  if (idx > -1) go(idx - 1);
}
async function go(i) {
  idx = i; save(); stopTimer();
  await publishState();
  render();
}
async function publishState() {
  const s = SLIDES[idx];
  let st;
  if (idx === -1) st = { phase: "lobby", idx };
  else if (s.type === "final") st = { phase: "final", idx };
  else if (s.type === "question" && rounds[s.id] === "revealed") st = { phase: "reveal", qid: s.id, idx };
  else if (s.type === "question" && rounds[s.id] === "board") st = { phase: "leaderboard", qid: s.id, idx };
  else st = { phase: "slide", idx, deck: s.deck || null };
  await api.set(`games/${pin}/state`, st);
}
function closeOverlays() {
  if (cardOpen()) { closeCard(); return true; }
  for (const id of ["#help", "#join-pop"]) if (!$(id).classList.contains("hidden")) { $(id).classList.add("hidden"); return true; }
  return false;
}

/* ---------------- rounds ---------------- */
async function openRound(q) {
  rounds[q.id] = "open"; save(); revealing = false;
  await api.set(`games/${pin}/answers/${q.id}`, null);
  await api.set(`games/${pin}/state`, { phase: "open", qid: q.id, idx, startedAt: api.TS, dur: DUR });
  resumeRound(q);
  scheduleBots(q);
}
function resumeRound(q) {
  live = {};
  unsubLive?.();
  unsubLive = api.on(`games/${pin}/answers/${q.id}`, v => { live = v || {}; updateLive(q); });
  render();
  startTimer(q);
}
function playerCount() { return Object.keys(players).length; }

async function reveal(q) {
  if (revealing || rounds[q.id] !== "open") return;
  revealing = true;
  stopTimer(); unsubLive?.(); unsubLive = null; clearBots();
  const st = state && state.qid === q.id ? state : null;
  const answers = (await api.get(`games/${pin}/answers/${q.id}`)) || {};
  const sc = (await api.get(`games/${pin}/scores`)) || {};
  const startedAt = st?.startedAt ?? 0, dur = st?.dur ?? ROUND_MS;
  const res = {}, upd = {};
  for (const [pid, a] of Object.entries(answers)) {
    if (!players[pid]) continue;
    const ms = Math.max(0, a.t - startedAt);
    const ok = a.c === q.answer;
    const p = scoreFor(ok, ms, dur);
    res[pid] = { p, ok, c: a.c, ms };
    upd[`scores/${pid}`] = (sc[pid] || 0) + p;
  }
  upd[`results/${q.id}`] = Object.keys(res).length ? res : null;
  upd.state = { phase: "reveal", qid: q.id, idx };
  results[q.id] = res;
  rounds[q.id] = "revealed"; save();
  await api.update(`games/${pin}`, upd);
  revealing = false;
  render();
}
async function showBoard(q) {
  rounds[q.id] = "board"; save();
  await api.set(`games/${pin}/state`, { phase: "leaderboard", qid: q.id, idx });
  render();
}

/* practice players for rehearsal */
async function addBots() {
  const upd = {};
  BOT_NAMES.forEach((n, i) => { upd[`players/bot_${i + 1}`] = { name: `${n} (practice)`, bot: true, joinedAt: api.TS }; });
  await api.update(`games/${pin}`, upd);
}
async function removeBots() {
  const upd = {};
  for (const id of Object.keys(players)) if (id.startsWith("bot_")) { upd[`players/${id}`] = null; upd[`scores/${id}`] = null; }
  await api.update(`games/${pin}`, upd);
}
function scheduleBots(q) {
  clearBots();
  for (const id of Object.keys(players).filter(i => i.startsWith("bot_"))) {
    const delay = 1500 + Math.random() * (DUR * 0.7);
    botTimers.push(setTimeout(() => {
      if (rounds[q.id] !== "open") return;
      const c = Math.random() < 0.6 ? q.answer : [0, 1, 2, 3].filter(x => x !== q.answer)[Math.floor(Math.random() * 3)];
      api.set(`games/${pin}/answers/${q.id}/${id}`, { c, t: api.TS }).catch(() => {});
    }, delay));
  }
}
function clearBots() { botTimers.forEach(clearTimeout); botTimers = []; }

/* ---------------- timer trace ---------------- */
function startTimer(q) {
  stopTimer();
  $("#trace-wrap").classList.remove("hidden");
  $("#stage").classList.add("round-open");
  const cv = $("#trace"), ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  const ecg = t => { // one synthetic beat per second, t in [0,1)
    const g = (m, s, a) => a * Math.exp(-((t - m) ** 2) / (2 * s * s));
    return g(0.18, 0.025, 0.12) + g(0.30, 0.008, -0.12) + g(0.33, 0.010, 1) + g(0.36, 0.010, -0.25) + g(0.58, 0.045, 0.22);
  };
  const tick = () => {
    const st = state && state.qid === q.id && typeof state.startedAt === "number" ? state : null;
    const dur = st?.dur ?? ROUND_MS;
    const elapsed = st ? Math.max(0, api.now() - st.startedAt) : 0;
    const remain = Math.max(0, dur - elapsed);
    const frac = Math.min(1, elapsed / dur);
    const secs = Math.ceil(remain / 1000);
    const alarm = secs <= 5;
    $("#secs").textContent = secs;
    $("#secs").classList.toggle("alarm", alarm);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(147,174,181,0.12)"; ctx.lineWidth = 2;
    for (let x = 0; x <= W; x += W / 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    ctx.strokeStyle = alarm ? "#ff5c6c" : "#3ddc84"; ctx.lineWidth = 5; ctx.lineJoin = "round";
    ctx.beginPath();
    const headX = frac * W;
    for (let x = 0; x <= headX; x += 3) {
      const tsec = (x / W) * (dur / 1000);
      const y = H * 0.72 - ecg(tsec % 1) * H * 0.62;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.fillStyle = alarm ? "#ff5c6c" : "#3ddc84";
    ctx.beginPath(); ctx.arc(headX, H * 0.72 - ecg(((frac * dur) / 1000) % 1) * H * 0.62, 8, 0, 7); ctx.fill();
    if (st && remain <= 0) { reveal(q); return; }
    raf = requestAnimationFrame(tick);
  };
  tick();
}
function stopTimer() { cancelAnimationFrame(raf); raf = null; $("#trace-wrap").classList.add("hidden"); $("#stage").classList.remove("round-open"); }

/* ---------------- rendering ---------------- */
function refreshCounts() {
  const n = playerCount();
  $("#count-small").textContent = `${n} ${n === 1 ? "player" : "players"}`;
}
function render() {
  const main = $("#slide");
  main.className = "";
  main.replaceChildren();
  $("#pin-small").textContent = pin || "";
  $("#join-short").textContent = shortJoin();
  $("#joinbar").classList.toggle("hidden", idx === -1);
  refreshCounts();
  $("#pos").textContent = idx === -1 ? "Lobby" : `${idx + 1} / ${SLIDES.length}`;
  $("#hint").textContent = "";
  renderChips($("#evidence"), []);
  if (idx === -1) { $("#crumb").textContent = "Lobby"; return renderLobby(main); }
  const s = SLIDES[idx];
  $("#crumb").textContent = s.type === "question" ? `Question ${QUESTION_BY_ID[s.id].number} of ${QUESTIONS.length}` : "";
  const fn = RENDER[s.type];
  fn(main, s);
  if (s.type !== "question") renderChips($("#evidence"), chipIdsFor(s.deck));
}

const RENDER = {
  title(main, s) {
    main.append(h("div", { class: "title-slide" },
      h("p", { class: "big", text: s.title }), h("p", { text: s.byline }), h("p", { class: "sub", text: s.sub })));
  },
  text(main, s) {
    main.append(h("h1", { class: "slide-title", text: s.title }), h("ul", { class: "bullets" }, s.bullets.map(b => h("li", { text: b }))));
  },
  question(main, q) {
    const st = rounds[q.id];
    const wrap = h("div", { class: q.dense ? "dense" : "" });
    main.append(wrap);
    if (st === "board") { wrap.append(h("h1", { class: "slide-title", text: "Leaderboard" })); return renderBoard(wrap, q); }
    wrap.append(h("h1", { class: "slide-title", text: q.title }));
    if (q.stem) wrap.append(h("p", { class: "lede", text: q.stem }));
    if (q.labs) wrap.append(h("div", { class: "labs" }, q.labs.map(([cap, rows]) =>
      h("div", { class: "grp" }, h("span", { class: "cap", text: cap }), rows.map(([k, v]) => h("span", { class: "pair" }, k, h("span", { class: "v", text: v })))))));
    if (q.list) wrap.append(h("ol", { class: "pt-list" }, q.list.map((t, i) => h("li", {}, h("b", { text: String(i + 1) }), t))));
    if (q.ask) wrap.append(h("p", { class: "ask", text: q.ask }));
    const opts = h("div", { class: "options" + (st === "revealed" ? " revealed" : ""), id: "opts" },
      q.options.map((t, i) => h("div", { class: `opt ${OPT_CLASS[i]}${i === q.answer ? " correct" : ""}`, "data-i": i },
        h("span", { class: "fill" }), h("span", { class: "letter", text: LETTERS[i] }), h("span", { class: "text" }, h("span", { class: "tick", "aria-label": "Correct answer", text: "✓" }), t), h("span", { class: "count num" }))));
    wrap.append(opts);
    if (!st) $("#hint").textContent = `Press → to open the ${DUR / 1000}-second round`;
    if (st === "open") updateLive(q);
    if (st === "revealed") {
      const res = results[q.id] || {};
      const counts = [0, 0, 0, 0];
      Object.values(res).forEach(r => counts[r.c]++);
      paintCounts(counts);
      const n = Object.keys(res).length, right = Object.values(res).filter(r => r.ok);
      const fastest = right.sort((a, b) => a.ms - b.ms)[0];
      const fastId = fastest && Object.keys(res).find(k => res[k] === fastest);
      const sum = h("p", { class: "summary" });
      if (!n) sum.textContent = "No answers this round.";
      else {
        sum.append(h("b", { text: `${right.length} of ${n}` }), ` answered correctly (${Math.round((100 * right.length) / n)}%).`);
        if (fastId) sum.append(" Fastest: ", h("b", { text: players[fastId]?.name || "Player" }), ` in ${(fastest.ms / 1000).toFixed(1)} s.`);
      }
      wrap.append(sum);
      $("#hint").textContent = "Press → for the leaderboard";
      renderChips($("#evidence"), chipIdsFor(q.revealDeck));
    }
  },
  explain(main, s) {
    main.append(h("h1", { class: "slide-title", text: s.title }));
    main.append(h("div", { class: "explain" }, s.groups.map(g => {
      const q = QUESTION_BY_ID[g.q];
      return h("section", {},
        h("h3", { text: `Question ${q.number}: ${LETTERS[q.answer]}` }),
        h("ol", {}, g.items.map(([a, why], i) => h("li", { class: `${OPT_CLASS[i]}${i === q.answer ? " key" : ""}` },
          h("span", { class: "l", text: LETTERS[i] }), h("span", {}, h("b", { text: a }), why)))));
    })));
  },
  antidotes(main, s) {
    const q = QUESTION_BY_ID[s.q];
    main.append(h("h1", { class: "slide-title", text: s.title }));
    main.append(h("div", { class: "antidotes options revealed" }, s.items.map(([drug, use], i) =>
      h("div", { class: `opt ${OPT_CLASS[i]}${i === q.answer ? " correct" : ""}` }, h("span", { class: "letter", text: LETTERS[i] }),
        h("span", { class: "text" }, h("span", { class: "tick", "aria-label": "Correct answer", text: "✓" }), drug, h("span", { text: use })), h("span", {})))));
  },
  toxidromes(main, s) {
    const q = QUESTION_BY_ID[s.q];
    main.append(h("h1", { class: "slide-title", text: s.title }));
    main.append(h("div", { class: "cards" }, s.items.map((it, i) => h("article", { class: `tcard ${OPT_CLASS[i]}${i === q.answer ? " key" : ""}` },
      h("div", { class: "who", text: `${LETTERS[i]}. ${it.who}` }), h("div", { class: "dx", text: it.dx }),
      h("div", { class: "detail", text: it.detail }), h("div", { class: "tx", text: `Treat: ${it.tx}` })))));
    if (s.footnote) main.append(h("p", { class: "footnote", text: s.footnote }));
  },
  alcohols(main, s) {
    const q = QUESTION_BY_ID[s.q];
    main.append(h("h1", { class: "slide-title", text: s.title }), h("p", { class: "lede", text: s.lead }));
    main.append(h("div", { class: "cards roomy" }, s.items.map((it, i) => h("article", { class: `tcard ${OPT_CLASS[i]}${i === q.answer ? " key" : ""}` },
      h("div", { class: "who", text: `${LETTERS[i]}. ${it.who}: ${it.math}` }), h("div", { class: "dx", text: it.dx }), h("div", { class: "tx", text: it.tx })))));
  },
  cardio(main, s) {
    main.append(h("h1", { class: "slide-title", text: s.title }));
    main.append(h("div", { class: "cards roomy" }, s.items.map((it, i) => h("article", { class: `tcard ${OPT_CLASS[i]}${it.key ? " key" : ""}` },
      h("div", { class: "who", text: `${i + 1}. ${it.who}` }), h("div", { class: "dx", text: it.dx }), h("div", { class: "detail", text: it.detail })))));
  },
  images(main, s) {
    main.append(h("h1", { class: "slide-title", text: s.title }));
    main.append(h("div", { class: "images" + (s.images.length > 1 ? " two" : "") }, s.images.map(([src, alt]) => h("figure", {}, h("img", { src, alt })))));
  },
  background(main, s) {
    main.append(h("h1", { class: "slide-title", text: s.title }));
    main.append(h("div", { class: "bg" },
      h("div", { class: "bg-points" + (s.points.length > 4 ? " tight" : "") }, s.points.map(([head, text]) => h("section", {}, h("h3", { text: head }), h("p", { text })))),
      h("aside", { class: "reading" },
        h("h3", { text: "Further reading" }),
        h("p", { class: "reading-sub", text: "Scan with your phone camera, or open it in the game." }),
        s.reading.map(id => {
          const r = REFS[id];
          const qr = h("span", { class: "rq" });
          qr.innerHTML = window.makeQRSvg(r.url, { level: "M", margin: 2 });
          return h("button", { type: "button", class: "read-tile", onclick: () => openCard(id) }, qr,
            h("span", { class: "rt" }, h("b", { text: r.title }), h("span", { text: r.tag })));
        }))));
  },
  list(main, s) {
    main.append(h("h1", { class: "slide-title", text: s.title }), h("ul", { class: "druglist" }, s.items.map(t => h("li", { text: t }))));
  },
  final(main) {
    const rows = standings(scores, players);
    main.append(h("h1", { class: "slide-title", text: "Fin" }));
    if (!rows.length) return main.append(h("p", { class: "empty", text: "No players joined this game." }));
    const step = (r, cls, place) => h("div", { class: `step ${cls}` }, h("div", { class: "place", text: place }),
      h("div", { class: "who", text: r ? r.name : "" }), h("div", { class: "pts num", text: r ? r.score.toLocaleString() : "" }));
    main.append(h("div", { class: "podium" }, step(rows[1], "p2", "2nd"), step(rows[0], "p1", "1st"), step(rows[2], "p3", "3rd")));
    if (rows.length > 3) main.append(h("div", { class: "rest" }, rows.slice(3, 15).map(r => h("span", { text: `${r.rank}. ${r.name}  ${r.score.toLocaleString()}` }))));
  },
  references(main) {
    main.append(h("h1", { class: "slide-title", text: "References" }));
    main.append(h("ol", { class: "reflist" }, REFERENCE_LIST.map(r => h("li", {}, r.cite + " ", h("a", { href: r.url, target: "_blank", rel: "noopener", text: "link" })))));
  },
};

function paintCounts(counts) {
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  document.querySelectorAll("#opts .opt").forEach(o => {
    const i = +o.dataset.i;
    o.querySelector(".count").textContent = counts[i] ? counts[i] : "";
    o.querySelector(".fill").style.width = `calc((100% - 64px) * ${counts[i] / total})`;
  });
}
function updateLive(q) {
  if (SLIDES[idx]?.id !== q.id || rounds[q.id] !== "open") return;
  const ans = Object.entries(live).filter(([pid]) => players[pid]);
  $("#answered").textContent = `${ans.length}/${playerCount()}`;
  const counts = [0, 0, 0, 0];
  ans.forEach(([, a]) => counts[a.c]++);
  paintCounts(showLive ? counts : [0, 0, 0, 0]);
  if (playerCount() > 0 && ans.length >= playerCount()) setTimeout(() => reveal(q), 900);
}

function renderBoard(wrap, q) {
  const res = results[q.id] || {};
  const now = standings(scores, players);
  const before = standings(Object.fromEntries(Object.keys(players).map(id => [id, (scores[id] || 0) - (res[id]?.p || 0)])), players);
  const prevRank = Object.fromEntries(before.map(r => [r.id, r.rank]));
  const qn = QUESTION_BY_ID[q.id].number;
  wrap.append(h("p", { class: "kicker", text: `After question ${qn} of ${QUESTIONS.length}` }));
  if (!now.length) return wrap.append(h("p", { class: "empty", text: "No players yet. Show the join code with J." }));
  wrap.append(h("div", { class: "board" }, now.slice(0, 8).map(r => {
    const d = qn > 1 ? (prevRank[r.id] || r.rank) - r.rank : 0;
    return h("div", { class: "row" }, h("span", { class: "rk", text: r.rank }),
      h("span", { class: `mv ${d > 0 ? "up" : d < 0 ? "down" : ""}`, text: d > 0 ? "▲" : d < 0 ? "▼" : "", "aria-label": d > 0 ? `up ${d}` : d < 0 ? `down ${-d}` : "" }),
      h("span", { class: "nm", text: r.name }), h("span", { class: "dl", text: res[r.id]?.p ? `+${res[r.id].p}` : "" }),
      h("span", { class: "sc", text: r.score.toLocaleString() }));
  })));
  $("#hint").textContent = "Press → to continue";
}

function renderLobby(main) {
  const url = joinURL();
  const roster = h("div", { class: "roster" });
  const ids = Object.keys(players);
  if (!ids.length) roster.append(h("span", { class: "empty", text: "Waiting for players. Names appear here as people join." }));
  for (const id of ids) {
    const p = players[id];
    roster.append(h("button", { type: "button", class: id.startsWith("bot_") ? "bot" : "", title: "Remove from game", text: p.name,
      onclick: async () => { if (confirm(`Remove ${p.name} from the game?`)) await api.update(`games/${pin}`, { [`players/${id}`]: null, [`scores/${id}`]: null }); } }));
  }
  const hasBots = ids.some(i => i.startsWith("bot_"));
  main.append(h("div", { class: "lobby" },
    h("div", {},
      h("p", { class: "big", text: "TOX" }),
      h("p", { class: "how", text: "Join on your phone: scan the code or go to" }),
      h("p", { class: "url", text: shortJoin() }),
      h("p", { class: "pinlabel", text: "Game PIN" }),
      h("p", { class: "pinbig", text: pin }),
      roster,
      h("div", { class: "lobby-tools" },
        h("button", { class: "tool", type: "button", text: hasBots ? "Remove practice players" : "Add 5 practice players", onclick: () => (hasBots ? removeBots() : addBots()) }),
        h("button", { class: "tool", type: "button", text: "Start a new game", onclick: newGame }),
        h("button", { class: "tool", type: "button", text: "Keys (?)", onclick: () => $("#help").classList.toggle("hidden") }))),
    qrBox(url)));
  $("#hint").textContent = `${ids.length} joined. Press → to start`;
}
function qrBox(url) {
  const box = h("div", { class: "qr" });
  box.innerHTML = window.makeQRSvg(url, { level: "M", margin: 2 });
  return box;
}
async function newGame() {
  if (!confirm("Start a new game? Scores from this game will no longer show here.")) return;
  stopTimer(); clearBots();
  await startSession(true);
  location.reload();
}
function toggleJoinPop() {
  const pop = $("#join-pop");
  if (pop.classList.toggle("hidden")) return;
  pop.replaceChildren(qrBox(joinURL()), h("p", { text: shortJoin() }), h("p", { class: "pinbig num", text: pin }));
}

/* ---------------- input ---------------- */
addEventListener("keydown", e => {
  if (e.target.closest?.("input, textarea")) return;
  const k = e.key;
  if (e.target.closest?.("button, a") && (k === " " || k === "Enter")) return;
  if (["ArrowRight", "PageDown", " "].includes(k)) { e.preventDefault(); next(); }
  else if (["ArrowLeft", "PageUp", "Backspace"].includes(k)) { e.preventDefault(); prev(); }
  else if (k === "Escape") closeOverlays();
  else if (k === "f" || k === "F") (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {});
  else if (k === "j" || k === "J") toggleJoinPop();
  else if (k === "e" || k === "E") endRound();
  else if (k === "h" || k === "H") { showLive = !showLive; const s = SLIDES[idx]; if (s?.type === "question") updateLive(s); }
  else if (k === "l" || k === "L") { if (!(SLIDES[idx]?.type === "question" && rounds[SLIDES[idx].id] === "open")) go(-1); }
  else if (k === "?") $("#help").classList.toggle("hidden");
});
$("#next").addEventListener("click", next);
$("#end-round").addEventListener("click", e => { e.currentTarget.blur(); endRound(); });
function endRound() {
  const s = SLIDES[idx];
  if (s?.type === "question" && rounds[s.id] === "open") reveal(s);
}
$("#prev").addEventListener("click", prev);
