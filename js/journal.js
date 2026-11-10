const YEARS_SHOWN = 4;
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

let entries = [];
let selectedYear = null;
let calYear = null;
let calMonth = null;

const timelineEl = document.getElementById("timeline");
const entryBox = document.getElementById("entryBox");
const calEl = document.getElementById("calendar");
const calTitle = document.getElementById("calTitle");
const calDays = document.getElementById("calDays");

function parseDate(value) {
  const [y, m, d] = String(value).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function countWords(text) {
  const words = text.trim().match(/\S+/g);
  return words ? words.length : 0;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(date) {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function shownYears() {
  const thisYear = new Date().getFullYear();
  const years = [];
  for (let y = thisYear - YEARS_SHOWN + 1; y <= thisYear; y++) years.push(y);
  return years;
}

function renderTimeline() {
  const years = shownYears();

  const words = {};
  entries.forEach((entry) => {
    const key = `${entry.date.getFullYear()}-${entry.date.getMonth()}`;
    words[key] = (words[key] || 0) + entry.words;
  });
  const most = Math.max(1, ...Object.values(words));

  timelineEl.innerHTML = "";

  years.forEach((year) => {
    const column = document.createElement("button");
    column.type = "button";
    column.className =
      "tl-year" + (year === selectedYear ? " is-selected" : "");
    column.dataset.year = year;
    column.setAttribute("aria-label", `Open ${year} calendar`);

    const bars = document.createElement("div");
    bars.className = "tl-bars";

    for (let month = 0; month < 12; month++) {
      const count = words[`${year}-${month}`] || 0;
      const bar = document.createElement("span");
      bar.className = "tl-bar";
      bar.style.height = count ? `max(2px, ${(count / most) * 100}%)` : "0";
      bar.title = `${MONTHS[month]} ${year}: ${count} words`;
      bars.appendChild(bar);
    }

    const label = document.createElement("span");
    label.className = "tl-label";
    label.textContent = year;

    column.append(bars, label);
    column.addEventListener("click", () => openCalendar(year, column));
    timelineEl.appendChild(column);
  });
}

function selectYear(year) {
  selectedYear = year;
  timelineEl.querySelectorAll(".tl-year").forEach((column) => {
    column.classList.toggle(
      "is-selected",
      Number(column.dataset.year) === year,
    );
  });
}

function showEntry(entry) {
  entryBox.innerHTML = "";

  if (!entry) {
    const message = document.createElement("div");
    message.className = "entry-message";
    message.textContent = "No journal entries yet.";
    entryBox.appendChild(message);
    return;
  }

  const article = document.createElement("article");
  article.className = "entry";

  const head = document.createElement("header");
  head.className = "entry-head";

  const heading = document.createElement("h2");
  heading.className = "entry-title";

  heading.textContent = entry.title || formatDate(entry.date);

  const date = document.createElement("time");
  date.className = "entry-date";
  date.textContent = formatDate(entry.date);

  head.append(heading);
  if (entry.title) head.append(date);

  const body = document.createElement("div");
  body.className = "entry-text";
  body.tabIndex = 0;
  body.textContent = entry.text;

  const layout = document.createElement("div");
  layout.className = "entry-layout";
  layout.append(head, body);
  article.appendChild(layout);
  entryBox.appendChild(article);

  selectYear(entry.date.getFullYear());
}

function placeCalendar(anchor) {
  const box = anchor.getBoundingClientRect();
  const width = calEl.offsetWidth;
  const height = calEl.offsetHeight;
  const left = box.left + box.width / 2 - width / 2;
  const top = box.bottom + 8;
  moveCalendarTo(left, top, width, height);
}

function moveCalendarTo(left, top, width, height) {
  const maxLeft = window.innerWidth - width - 4;
  const maxTop = window.innerHeight - height - 4;
  calEl.style.left = `${Math.max(4, Math.min(left, maxLeft))}px`;
  calEl.style.top = `${Math.max(4, Math.min(top, maxTop))}px`;
}

function openCalendar(year, anchor) {
  const inYear = entries.filter((e) => e.date.getFullYear() === year);
  const now = new Date();
  calYear = year;
  calMonth = inYear.length
    ? inYear[0].date.getMonth()
    : year === now.getFullYear()
      ? now.getMonth()
      : 0;

  selectYear(year);
  renderCalendar();

  if (calEl.hidden) {
    calEl.hidden = false;
    placeCalendar(anchor);
  }
}

function closeCalendar() {
  calEl.hidden = true;
}

function moveMonth(step) {
  calMonth += step;
  if (calMonth > 11) {
    calMonth = 0;
    calYear += 1;
  } else if (calMonth < 0) {
    calMonth = 11;
    calYear -= 1;
  }
  selectYear(calYear);
  renderCalendar();
}

function renderCalendar() {
  calTitle.textContent = `${MONTHS[calMonth]} ${calYear}`;
  calDays.innerHTML = "";

  const firstWeekday = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  for (let i = 0; i < firstWeekday; i++) {
    calDays.appendChild(document.createElement("span"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(calYear, calMonth, day);
    const onDay = entries.filter((e) => sameDay(e.date, date));

    if (onDay.length) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cal-day has-entry";
      button.textContent = day;
      button.title = onDay.map((e) => e.title || "Entry").join(", ");
      button.addEventListener("click", () => {
        showEntry(onDay[0]);

        if (window.innerWidth < 700) closeCalendar();
        entryBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      calDays.appendChild(button);
    } else {
      const span = document.createElement("span");
      span.className = "cal-day";
      span.textContent = day;
      calDays.appendChild(span);
    }
  }
}

document
  .getElementById("calPrev")
  .addEventListener("click", () => moveMonth(-1));
document
  .getElementById("calNext")
  .addEventListener("click", () => moveMonth(1));
document.getElementById("calClose").addEventListener("click", closeCalendar);

document.addEventListener("pointerdown", (event) => {
  if (calEl.hidden) return;
  if (calEl.contains(event.target)) return;
  if (event.target.closest(".tl-year")) return;
  closeCalendar();
});

document.addEventListener("keydown", (event) => {
  if (calEl.hidden) return;
  if (event.key === "Escape") closeCalendar();

  if (calEl.contains(document.activeElement)) {
    if (event.key === "ArrowLeft") moveMonth(-1);
    if (event.key === "ArrowRight") moveMonth(1);
  }
});

let drag = null;

calEl.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  const box = calEl.getBoundingClientRect();
  drag = { dx: event.clientX - box.left, dy: event.clientY - box.top };
  calEl.setPointerCapture(event.pointerId);
  calEl.classList.add("is-dragging");
});

calEl.addEventListener("pointermove", (event) => {
  if (!drag) return;
  moveCalendarTo(
    event.clientX - drag.dx,
    event.clientY - drag.dy,
    calEl.offsetWidth,
    calEl.offsetHeight,
  );
});

function endDrag() {
  drag = null;
  calEl.classList.remove("is-dragging");
}

calEl.addEventListener("pointerup", endDrag);
calEl.addEventListener("pointercancel", endDrag);

window.addEventListener("resize", () => {
  if (calEl.hidden) return;
  moveCalendarTo(
    calEl.offsetLeft,
    calEl.offsetTop,
    calEl.offsetWidth,
    calEl.offsetHeight,
  );
});

async function loadJournal() {
  const response = await fetch("/journal/entries.json");
  if (!response.ok) throw new Error(`entries list returned ${response.status}`);
  const list = await response.json();

  entries = await Promise.all(
    list.map(async (item) => {
      let text = "";
      try {
        const res = await fetch(`/journal/${item.id}.txt`);
        if (res.ok) text = await res.text();
      } catch (error) {
        console.error(`Could not load entry ${item.id}`, error);
      }
      return {
        id: item.id,
        title: item.title,
        date: parseDate(item.date),
        text: text.trim(),
        words: countWords(text),
      };
    }),
  );

  entries.sort((a, b) => b.date - a.date);

  selectedYear = entries.length
    ? entries[0].date.getFullYear()
    : new Date().getFullYear();

  renderTimeline();
  showEntry(entries[0]);
}

loadJournal().catch((error) => {
  console.error("Error loading journal:", error);
  renderTimeline();
  entryBox.innerHTML = "";
  const message = document.createElement("div");
  message.className = "entry-message is-error";
  message.textContent = "Failed to load the journal. Please try again later.";
  entryBox.appendChild(message);
});
