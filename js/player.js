import { createBackend, backendMode } from "./backend.js?v=202610241715";
import { SLIDES, QUESTIONS, QUESTION_BY_ID, LETTERS, standings } from "./slides.js?v=202610241715";
import { chipIdsFor, renderChips, openCard } from "./evidence.js?v=202610241715";
import { REFS } from "./refs.js?v=202610241715";

const params = new URLSearchParams(location.search);
const LKEY = "toxlive-player-" + backendMode();
const OPT_CLASS = ["opt-a", "opt-b", "opt-c", "opt-d"];
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

let api, pin = (params.get("g") || "").trim(), myName = "";
let state = null, players = {}, scores = {}, myAnswer = null, myResult = null;
let seenSelf = false, joined = false, curQ = null, unsubAns = null, unsubRes = null, raf = null, subs = [];

(async function boot() {
  try {
    api = await createBackend("player");
  } catch (e) {
    return show(h("h1", { text: "Not ready yet" }),
      h("p", { class: "muted", text: e.code === "unconfigured" ? "The presenter hasn't finished setting up the live game. Try again in a minute." : `Couldn't connect: ${e.message}` }));
  }
  await api.ready;
  const saved = JSON.parse(localStorage.getItem(LKEY) || "null");
  if (saved && (!pin || saved.pin === pin)) {
    const me = await api.get(`games/${saved.pin}/players/${api.uid}`);
    if (me) { pin = saved.pin; myName = me.name; return enter(); }
  }
  joinForm();
})();

function show(...nodes) { $("#view").replaceChildren(...nodes); }

function joinForm(message) {
  stopTimer();
  $("#timebar").classList.add("hidden");
  const err = h("p", { class: "error", role: "alert", text: message || "" });
  const pinIn = h("input", { class: "pin num", inputmode: "numeric", autocomplete: "off", maxlength: "4", pattern: "[0-9]{4}", value: pin, "aria-label": "Game PIN" });
  const nameIn = h("input", { maxlength: "20", autocomplete: "nickname", value: myName, placeholder: "e.g. Dr. Atropine", "aria-label": "Your name on the leaderboard" });
  const btn = h("button", { class: "primary", type: "submit", text: "Join the game" });
  const form = h("form", { class: "choices" },
    h("label", {}, "Game PIN", pinIn),
    h("label", {}, "Name on the leaderboard", nameIn),
    btn, err);
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const p = pinIn.value.trim(), n = nameIn.value.trim().replace(/\s+/g, " ");
    if (!/^\d{4}$/.test(p)) { err.textContent = "Enter the 4-digit PIN shown on the screen."; return pinIn.focus(); }
    if (!n) { err.textContent = "Pick a name for the leaderboard."; return nameIn.focus(); }
    btn.disabled = true; err.textContent = "";
    try {
      if (!(await api.get(`games/${p}/host`))) throw Object.assign(new Error(), { user: `No game with PIN ${p}. Check the PIN on the screen.` });
      await api.set(`games/${p}/players/${api.uid}`, { name: n, joinedAt: api.TS });
      pin = p; myName = n;
      localStorage.setItem(LKEY, JSON.stringify({ pin, name: n }));
      enter();
    } catch (ex) {
      err.textContent = ex.user || "Couldn't join. Check your connection and try again.";
      btn.disabled = false;
    }
  });
  show(h("h1", { text: "Join the case" }), h("p", { class: "muted", text: "Answer on your phone. Faster correct answers earn more points." }), form);
  (pin ? nameIn : pinIn).focus();
}

function enter() {
  joined = true; seenSelf = false;
  $("#me").textContent = myName;
  subs.forEach(u => u()); subs = [];
  subs.push(api.on(`games/${pin}/players`, v => {
    players = v || {};
    if (players[api.uid]) { seenSelf = true; myName = players[api.uid].name; $("#me").textContent = myName; }
    else if (seenSelf && joined) { joined = false; subs.forEach(u => u()); subs = []; return joinForm("You were removed from the game. Rejoin if that was a mistake."); }
    paint();
  }));
  subs.push(api.on(`games/${pin}/scores`, v => { scores = v || {}; $("#myscore").textContent = (scores[api.uid] || 0).toLocaleString(); paint(); }));
  subs.push(api.on(`games/${pin}/state`, v => { state = v; follow(); paint(); }));
  paint();
}

function follow() {
  const qid = state?.qid || null;
  if (qid === curQ) return;
  curQ = qid; myAnswer = null; myResult = null;
  unsubAns?.(); unsubRes?.();
  if (!qid) return;
  unsubAns = api.on(`games/${pin}/answers/${qid}/${api.uid}`, v => { myAnswer = v; paint(); });
  unsubRes = api.on(`games/${pin}/results/${qid}/${api.uid}`, v => { myResult = v; paint(); });
}

function myStanding() {
  const rows = standings(scores, players);
  const me = rows.find(r => r.id === api.uid);
  const anyScore = rows.some(r => r.score > 0);
  return { rank: anyScore ? me?.rank : null, of: rows.length, score: me?.score || 0 };
}
const ordinal = n => { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

function stats() {
  const m = myStanding();
  return h("div", { class: "stats" },
    h("div", { class: "stat" }, h("b", { text: m.score.toLocaleString() }), h("span", { text: "points" })),
    h("div", { class: "stat" }, h("b", { text: m.rank ? ordinal(m.rank) : "–" }), h("span", { text: `of ${m.of} players` })));
}

function paint() {
  if (!joined) return;
  const ph = state?.phase || "lobby";
  if (ph !== "open") { stopTimer(); $("#timebar").classList.add("hidden"); }
  if (ph === "open") return paintQuestion();
  if (ph === "reveal") return paintResult();
  if (ph === "leaderboard") {
    const m = myStanding();
    return show(h("div", { class: "big-state" }, h("p", { class: "muted", text: "Leaderboard" }), h("p", { class: "word", text: m.rank ? ordinal(m.rank) : "–" }), h("p", { class: "muted", text: `of ${m.of} players` })), stats());
  }
  if (ph === "final") {
    const m = myStanding();
    return show(h("h1", { text: "Final standings" }), h("div", { class: "big-state" }, h("p", { class: "word", text: m.rank ? ordinal(m.rank) : "–" }), h("p", { class: "muted", text: `of ${m.of} players` })), stats(), h("p", { class: "muted", text: "Thanks for playing." }));
  }
  // lobby or a regular slide
  const slide = state?.idx >= 0 ? SLIDES[state.idx] : null;
  if (slide?.type === "background") {
    return show(h("h1", { text: (t => /^[a-z]/.test(t) ? t[0].toUpperCase() + t.slice(1) : t)(slide.title.replace(/^Background: /, "")) }),
      h("p", { class: "muted", text: "Further reading from the slide on screen." }),
      h("div", { class: "reading-list" }, slide.reading.map(id => {
        const r = REFS[id];
        return h("article", { class: "read-item" },
          h("b", { text: r.title }), h("span", { class: "muted", text: r.tag }),
          h("div", { class: "read-actions" },
            h("a", { href: r.url, target: "_blank", rel: "noopener", text: "Open paper ↗" }),
            h("button", { type: "button", text: "Summary", onclick: () => openCard(id) })));
      })),
      stats());
  }
  const chips = h("div", { class: "evidence" });
  renderChips(chips, chipIdsFor(slide?.deck), "Evidence on screen now");
  show(h("h1", { text: `You're in, ${myName}.` }),
    h("p", { class: "muted", text: "Eyes on the screen. Questions open here when the presenter starts a round." }),
    h("div", { class: "pulse", "aria-hidden": "true" }),
    stats(), chips,
    h("p", { class: "foot-note", text: `Game PIN ${pin}` }));
}

function paintQuestion() {
  const q = QUESTION_BY_ID[state.qid];
  if (!q) return;
  const locked = !!myAnswer;
  const wasOpen = !!$("#view details")?.open;
  const secs = h("span", { class: "secs", id: "psecs" });
  const ctx = [];
  if (q.stem) ctx.push(h("p", { text: q.stem }));
  if (q.list) ctx.push(h("ol", {}, q.list.map(t => h("li", { text: t }))));
  if (q.ask) ctx.push(h("p", { text: q.ask }));
  const choices = h("div", { class: "choices" + (locked ? " locked" : "") },
    q.options.map((t, i) => h("button", {
      type: "button", class: `choice ${OPT_CLASS[i]}`, "aria-pressed": String(myAnswer?.c === i), disabled: locked ? "" : false,
      onclick: () => answer(q, i),
    }, h("span", { class: "l", text: LETTERS[i] }), h("span", { class: "t", text: t }))));
  show(
    h("div", { class: "qhead" }, h("span", { class: "num", text: `Question ${q.number} of ${QUESTIONS.length}` }), secs),
    h("details", { open: wasOpen ? "" : false }, h("summary", { text: "Show the question" }), ...ctx),
    choices,
    h("p", { class: "muted", role: "status", id: "lockmsg", text: locked ? `Locked in: ${LETTERS[myAnswer.c]}. Watch the screen for the answer.` : "Tap your answer. You can't change it." }));
  startTimer();
}

async function answer(q, i) {
  if (myAnswer || state?.phase !== "open" || state.qid !== q.id) return;
  myAnswer = { c: i, pending: true };
  paint();
  try {
    await api.set(`games/${pin}/answers/${q.id}/${api.uid}`, { c: i, t: api.TS });
  } catch {
    myAnswer = null;
    paint();
    const m = $("#lockmsg");
    if (m) { m.textContent = "That answer didn't go through. The round may have closed."; m.className = "error"; }
  }
}

function paintResult() {
  const q = QUESTION_BY_ID[state.qid];
  if (!q) return;
  const r = myResult;
  const right = h("div", { class: `answer-was ${OPT_CLASS[q.answer]}` }, h("b", { text: `Answer ${LETTERS[q.answer]}: ` }), q.options[q.answer]);
  let top;
  if (r?.ok) top = h("div", { class: "big-state ok" }, h("p", { class: "word", text: "Correct" }), h("p", { class: "pts", text: `+${r.p}` }), h("p", { class: "muted", text: `Answered in ${(r.ms / 1000).toFixed(1)} s` }));
  else if (r) top = h("div", { class: "big-state bad" }, h("p", { class: "word", text: "Not this one" }), h("p", { class: "muted", text: `You picked ${LETTERS[r.c]}.` }));
  else if (myAnswer) top = h("div", { class: "big-state" }, h("p", { class: "muted", text: "Scoring your answer…" }));
  else top = h("div", { class: "big-state" }, h("p", { class: "word", text: "No answer" }), h("p", { class: "muted", text: "The round closed before you answered." }));
  const slide = SLIDES[state.idx];
  const chips = h("div", { class: "evidence" });
  renderChips(chips, chipIdsFor(slide?.revealDeck), "Evidence for this answer");
  show(top, right, stats(), chips);
}

function startTimer() {
  if (raf) return;
  $("#timebar").classList.remove("hidden");
  const tick = () => {
    if (state?.phase !== "open" || typeof state.startedAt !== "number") { raf = requestAnimationFrame(tick); return; }
    const remain = Math.max(0, state.startedAt + state.dur - api.now());
    const frac = remain / state.dur;
    $("#timebar span").style.transform = `scaleX(${frac})`;
    const alarm = remain <= 5000;
    $("#timebar").classList.toggle("alarm", alarm);
    const s = $("#psecs");
    if (s) { s.textContent = Math.ceil(remain / 1000); s.classList.toggle("alarm", alarm); }
    raf = requestAnimationFrame(tick);
  };
  tick();
}
function stopTimer() { cancelAnimationFrame(raf); raf = null; }
