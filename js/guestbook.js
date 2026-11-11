const MAX_LENGTH = 300;
const PHONE_SCALE = 0.8;
const TOKEN_KEY = "luck-guestbook-token";
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let boardSize = { width: 3200, height: 2400 };
let notes = [];
let scale = 1;
let draft = null;

const frame = document.getElementById("boardFrame");
const sizer = document.getElementById("boardSizer");
const board = document.getElementById("board");
const arrowsSvg = document.getElementById("arrows");
const statusEl = document.getElementById("boardStatus");
const focusEl = document.getElementById("focus");
const focusNotes = document.getElementById("focusNotes");

function formatDate(iso) {
  const date = new Date(iso);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function setStatus(text) {
  statusEl.textContent = text || "";
}

function getToken() {
  let token = null;
  try {
    token = localStorage.getItem(TOKEN_KEY);
  } catch {}
  if (!token) {
    token = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  }
  return token;
}

function seededRandom(seedText) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function fitBoard() {
  scale = frame.clientWidth < 600 ? PHONE_SCALE : 1;
  board.style.width = `${boardSize.width}px`;
  board.style.height = `${boardSize.height}px`;
  board.style.transform = `scale(${scale})`;
  sizer.style.width = `${boardSize.width * scale}px`;
  sizer.style.height = `${boardSize.height * scale}px`;
}

new ResizeObserver(fitBoard).observe(frame);

function centerBoard() {
  frame.scrollLeft = (boardSize.width * scale - frame.clientWidth) / 2;
  frame.scrollTop = (boardSize.height * scale - frame.clientHeight) / 2;
}

let pan = null;
let justPanned = false;

frame.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  if (event.target.closest(".draft, .note.is-linked")) return;
  pan = {
    x: event.clientX,
    y: event.clientY,
    left: frame.scrollLeft,
    top: frame.scrollTop,
    moved: false,
  };
});

window.addEventListener("pointermove", (event) => {
  if (!pan) return;
  const dx = event.clientX - pan.x;
  const dy = event.clientY - pan.y;
  if (!pan.moved && Math.hypot(dx, dy) < 5) return;
  pan.moved = true;
  frame.classList.add("is-panning");
  frame.scrollLeft = pan.left - dx;
  frame.scrollTop = pan.top - dy;
});

window.addEventListener("pointerup", () => {
  if (!pan) return;
  justPanned = pan.moved;
  pan = null;
  frame.classList.remove("is-panning");
});

function notesByAuthor(author) {
  return notes
    .filter((n) => n.author === author)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function hasLinks(note) {
  return notesByAuthor(note.author).length > 1;
}

function renderNote(note) {
  const el = document.createElement("div");
  el.className = "note";
  el.dataset.id = note.id;
  el.style.left = `${note.x}px`;
  el.style.top = `${note.y}px`;

  const text = document.createElement("div");
  text.className = "note-text";
  text.textContent = note.text;
  el.appendChild(text);

  if (note.name) {
    const name = document.createElement("div");
    name.className = "note-name";
    name.textContent = `- ${note.name}`;
    el.appendChild(name);
  }

  const date = document.createElement("div");
  date.className = "note-date";
  date.textContent = formatDate(note.date);
  el.appendChild(date);

  if (hasLinks(note)) {
    el.classList.add("is-linked");
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", "Show all notes from this person");
  }

  board.appendChild(el);
  return el;
}

function renderAllNotes() {
  board.querySelectorAll(".note").forEach((el) => el.remove());
  notes.forEach(renderNote);
  drawArrows();
}

function noteBox(note) {
  const el = board.querySelector(`.note[data-id="${CSS.escape(note.id)}"]`);
  if (!el) return null;
  return {
    cx: note.x + el.offsetWidth / 2,
    cy: note.y + el.offsetHeight / 2,
    hw: el.offsetWidth / 2,
    hh: el.offsetHeight / 2,
  };
}

function edgePoint(box, tx, ty, gap) {
  const dx = tx - box.cx;
  const dy = ty - box.cy;
  const t = Math.min(
    dx ? box.hw / Math.abs(dx) : Infinity,
    dy ? box.hh / Math.abs(dy) : Infinity,
  );
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: box.cx + dx * t + (dx / length) * gap,
    y: box.cy + dy * t + (dy / length) * gap,
  };
}

function wobblyArrow(from, to, random) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;

  const bend = (random() - 0.5) * 0.3 * length;
  const cx = (from.x + to.x) / 2 + nx * bend;
  const cy = (from.y + to.y) / 2 + ny * bend;

  function shakyPoints(amount) {
    const steps = Math.max(4, Math.round(length / 45));
    const points = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = (1 - t) ** 2 * from.x + 2 * (1 - t) * t * cx + t ** 2 * to.x;
      const y = (1 - t) ** 2 * from.y + 2 * (1 - t) * t * cy + t ** 2 * to.y;
      const wobble = i === 0 || i === steps ? 0 : (random() - 0.5) * amount;
      points.push({ x: x + nx * wobble, y: y + ny * wobble });
    }
    return points;
  }

  function pathThrough(points) {
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 1; i < points.length - 1; i++) {
      const mx = (points[i].x + points[i + 1].x) / 2;
      const my = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
    }
    const last = points[points.length - 1];
    return `${d} L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  }

  const angle = Math.atan2(to.y - cy, to.x - cx);
  const head = (side) => {
    const a = angle + Math.PI + side * (0.42 + (random() - 0.5) * 0.2);
    const size = 11 + random() * 5;
    const midX = to.x + Math.cos(a) * size * 0.5 + (random() - 0.5) * 2;
    const midY = to.y + Math.sin(a) * size * 0.5 + (random() - 0.5) * 2;
    return `M ${to.x} ${to.y} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${(to.x + Math.cos(a) * size).toFixed(1)} ${(to.y + Math.sin(a) * size).toFixed(1)}`;
  };

  return [
    `<path class="arrow-main" d="${pathThrough(shakyPoints(5))}" />`,
    `<path class="arrow-sketch" d="${pathThrough(shakyPoints(7))}" />`,
    `<path class="arrow-main" d="${head(1)}" />`,
    `<path class="arrow-main" d="${head(-1)}" />`,
  ].join("");
}

function drawArrows() {
  const authors = new Set(notes.map((n) => n.author));
  let paths = "";

  authors.forEach((author) => {
    const list = notesByAuthor(author);
    for (let i = 1; i < list.length; i++) {
      const a = noteBox(list[i - 1]);
      const b = noteBox(list[i]);
      if (!a || !b) continue;
      const random = seededRandom(list[i - 1].id + list[i].id);
      const from = edgePoint(a, b.cx, b.cy, 6);
      const to = edgePoint(b, a.cx, a.cy, 6);
      paths += wobblyArrow(from, to, random);
    }
  });

  arrowsSvg.setAttribute(
    "viewBox",
    `0 0 ${boardSize.width} ${boardSize.height}`,
  );
  arrowsSvg.innerHTML = paths;
}

function openFocus(note) {
  const list = notesByAuthor(note.author);
  focusNotes.innerHTML = "";

  list.forEach((item, i) => {
    if (i > 0) {
      const arrow = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      arrow.setAttribute("class", "focus-arrow");
      arrow.setAttribute("viewBox", "0 0 40 50");
      arrow.innerHTML =
        '<path d="M 21 3 Q 16 24 20 44" /><path d="M 20 45 L 11 34" /><path d="M 20 45 L 29 35" />';
      focusNotes.appendChild(arrow);
    }

    const card = document.createElement("article");
    card.className = "focus-note" + (item.id === note.id ? " is-current" : "");

    const text = document.createElement("div");
    text.className = "note-text";
    text.textContent = item.text;
    card.appendChild(text);

    const meta = document.createElement("div");
    meta.className = "focus-meta";
    meta.textContent =
      (item.name ? `${item.name} · ` : "") + formatDate(item.date);
    card.appendChild(meta);

    focusNotes.appendChild(card);
  });

  focusEl.hidden = false;
  document.body.classList.add("focus-open");
  document.getElementById("focusClose").focus();
}

function closeFocus() {
  focusEl.hidden = true;
  document.body.classList.remove("focus-open");
}

document.getElementById("focusClose").addEventListener("click", closeFocus);
focusEl.addEventListener("click", (event) => {
  if (event.target === focusEl) closeFocus();
});

function removeDraft() {
  if (draft) draft.el.remove();
  draft = null;
}

const NAME_KEY = "luck-guestbook-name";
const MAX_NAME = 30;

function draftName() {
  return draft ? draft.name.value.trim() : "";
}

function draftText() {
  return draft ? draft.input.innerText.replace(/ /g, " ").trim() : "";
}

function updateCount() {
  const length = [...draftText()].length;
  draft.count.textContent = `${length}/${MAX_LENGTH}`;
  draft.confirm.disabled = length === 0 || !draftName();
}

function blockPaste(event) {
  event.preventDefault();
  setStatus("Pasting is turned off here: please type your note ✎");
}

function startDraft(x, y) {
  removeDraft();
  setStatus("");

  const el = document.createElement("div");
  el.className = "draft";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  const input = document.createElement("div");
  input.className = "draft-input";
  input.setAttribute("role", "textbox");
  input.setAttribute("aria-multiline", "true");
  input.setAttribute("aria-label", "Your note");
  input.spellcheck = true;

  try {
    input.contentEditable = "plaintext-only";
  } catch {}
  if (input.contentEditable !== "plaintext-only")
    input.contentEditable = "true";

  const name = document.createElement("input");
  name.className = "draft-name";
  name.type = "text";
  name.placeholder = "your name";
  name.maxLength = MAX_NAME;
  name.autocomplete = "nickname";
  name.setAttribute("aria-label", "Your name");
  try {
    name.value = localStorage.getItem(NAME_KEY) || "";
  } catch {}

  const tools = document.createElement("div");
  tools.className = "draft-tools";

  const count = document.createElement("span");
  count.className = "draft-count";

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "draft-btn draft-cancel";
  cancel.textContent = "✕";
  cancel.setAttribute("aria-label", "Cancel note");

  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className = "draft-btn draft-confirm";
  confirm.textContent = "✓";
  confirm.setAttribute("aria-label", "Keep note");

  tools.append(count, cancel, confirm);
  el.append(input, name, tools);
  board.appendChild(el);

  draft = { el, input, name, count, confirm, x, y, saving: false };
  updateCount();

  input.addEventListener("paste", blockPaste);
  input.addEventListener("drop", blockPaste);
  input.addEventListener("dragover", (e) => e.preventDefault());
  input.addEventListener("beforeinput", (event) => {
    if (/^insertFrom(Paste|Drop|Yank|PasteAsQuotation)/.test(event.inputType)) {
      blockPaste(event);
      return;
    }

    if (event.inputType.startsWith("insert") && event.data) {
      if ([...draftText()].length + [...event.data].length > MAX_LENGTH) {
        event.preventDefault();
      }
    }
  });
  input.addEventListener("input", updateCount);
  name.addEventListener("input", updateCount);
  name.addEventListener("paste", blockPaste);
  name.addEventListener("drop", blockPaste);
  name.addEventListener("keydown", (event) => {
    if (event.key === "Escape") removeDraft();
    if (event.key === "Enter") saveDraft();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") removeDraft();
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) saveDraft();
  });

  cancel.addEventListener("click", (event) => {
    event.stopPropagation();
    removeDraft();
    setStatus("");
  });
  confirm.addEventListener("click", (event) => {
    event.stopPropagation();
    saveDraft();
  });

  input.focus({ preventScroll: true });
}

async function saveDraft() {
  if (!draft || draft.saving) return;
  const text = draftText();
  const name = draftName();
  if (!text) return;
  if (!name) {
    setStatus("Please add your name ✎");
    draft.name.focus();
    return;
  }

  draft.saving = true;
  draft.el.classList.add("is-saving");
  setStatus("Saving...");

  try {
    const response = await fetch("/api/guestbook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        name,
        x: draft.x,
        y: draft.y,
        token: getToken(),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(result.error || "Couldn't save the note.");

    try {
      localStorage.setItem(NAME_KEY, name);
    } catch {}
    removeDraft();
    notes.push(result.note);
    renderAllNotes();
    setStatus("Thanks for the note! ♡");
  } catch (error) {
    console.error(error);
    if (draft) {
      draft.saving = false;
      draft.el.classList.remove("is-saving");
    }
    setStatus(
      error.message && !error.message.startsWith("Unexpected")
        ? error.message
        : "Couldn't save the note. Please try again.",
    );
  }
}

board.addEventListener("click", (event) => {
  if (justPanned) {
    justPanned = false;
    return;
  }

  if (event.target.closest(".draft")) return;

  const noteEl = event.target.closest(".note");
  if (noteEl) {
    const note = notes.find((n) => n.id === noteEl.dataset.id);
    if (note && hasLinks(note)) openFocus(note);
    else noteEl.classList.toggle("show-date");
    return;
  }

  if (draft && draftText()) {
    draft.input.focus();
    return;
  }

  const rect = board.getBoundingClientRect();
  const x = Math.round((event.clientX - rect.left) / scale);
  const y = Math.round((event.clientY - rect.top) / scale);
  startDraft(
    Math.min(Math.max(x, 0), boardSize.width - 160),
    Math.min(Math.max(y, 0), boardSize.height - 80),
  );
});

board.addEventListener("keydown", (event) => {
  const noteEl = event.target.closest?.(".note.is-linked");
  if (noteEl && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    const note = notes.find((n) => n.id === noteEl.dataset.id);
    if (note) openFocus(note);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !focusEl.hidden) closeFocus();
});

async function loadNotes() {
  try {
    const response = await fetch("/api/guestbook");
    if (!response.ok) throw new Error(`guestbook returned ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(
      "Guestbook server not reachable, showing saved notes only.",
      error,
    );
    const response = await fetch("/data/guestbook.json");
    const seed = await response.json();
    return { ...seed, canPost: false };
  }
}

loadNotes()
  .then((data) => {
    boardSize = data.board || boardSize;
    notes = data.notes || [];
    fitBoard();
    renderAllNotes();
    centerBoard();

    document.fonts?.ready.then(drawArrows);
  })
  .catch((error) => {
    console.error(error);
    setStatus("Couldn't load the guestbook. Please try again later.");
  });
