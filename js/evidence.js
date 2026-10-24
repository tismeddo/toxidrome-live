import { REFS, DECK_CHIPS } from "./refs.js?v=202610241638";

export function chipIdsFor(deckSlide) {
  return (deckSlide && DECK_CHIPS[String(deckSlide)]) || [];
}

export function renderChips(container, ids, label = "Evidence") {
  container.replaceChildren();
  if (!ids.length) return;
  const l = document.createElement("span");
  l.className = "evidence-label";
  l.textContent = label;
  container.append(l);
  for (const id of ids) {
    const r = REFS[id];
    if (!r) continue;
    const b = document.createElement("button");
    b.className = "chip";
    b.type = "button";
    b.textContent = r.tag;
    b.addEventListener("click", () => openCard(id));
    container.append(b);
  }
}

let lastFocus = null;
export function openCard(id) {
  const r = REFS[id];
  if (!r) return;
  closeCard();
  lastFocus = document.activeElement;
  const back = document.createElement("div");
  back.className = "card-backdrop";
  back.id = "ref-card";
  back.addEventListener("click", e => { if (e.target === back) closeCard(); });
  const card = document.createElement("article");
  card.className = "ref-card";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-modal", "true");
  card.setAttribute("aria-label", r.title);

  const h = el("h2", r.title);
  const badge = el("span", r.badge, "badge");
  const ul = document.createElement("ul");
  r.findings.forEach(f => ul.append(el("li", f)));
  const bottom = el("div", "", "bottom");
  bottom.append(el("small", "Bottom line"), document.createTextNode(r.bottom));
  const cite = el("div", "", "cite");
  const p = el("p", r.cite);
  const a = document.createElement("a");
  a.href = r.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = `Open ${r.link_label} ↗`;
  p.append(document.createElement("br"), a);
  const close = el("button", "Close", "close");
  close.type = "button";
  close.addEventListener("click", closeCard);
  cite.append(p, close);
  card.append(h, badge, ul, bottom, cite);
  back.append(card);
  document.body.append(back);
  close.focus({ preventScroll: true });
  card.scrollTop = 0;
}

export function closeCard() {
  const c = document.getElementById("ref-card");
  if (c) { c.remove(); lastFocus?.focus?.(); return true; }
  return false;
}
export function cardOpen() { return !!document.getElementById("ref-card"); }

function el(tag, text, cls) {
  const e = document.createElement(tag);
  if (text) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}
