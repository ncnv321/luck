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

const ROW_LAYOUT = window.matchMedia("(min-width: 600px)");
const statsEl = document.querySelector(".stats");
const introEl = document.querySelector(".intro");
const pyramidSpot = statsEl.nextElementSibling;

function placeStats() {
  if (ROW_LAYOUT.matches) {
    introEl.after(statsEl);
    statsEl.classList.add("is-row");
  } else {
    introEl.insertBefore(statsEl, pyramidSpot);
    statsEl.classList.remove("is-row");
  }
}

placeStats();
ROW_LAYOUT.addEventListener("change", placeStats);

const statTexts = document.querySelectorAll(".stat-text");

function fits(box) {
  return (
    box.scrollWidth <= box.clientWidth + 1 &&
    box.scrollHeight <= box.clientHeight + 1
  );
}

function largestFit(box) {
  let low = 4;
  let high = 60;

  while (high - low > 0.5) {
    const mid = (low + high) / 2;
    box.style.fontSize = `${mid}px`;
    if (fits(box)) low = mid;
    else high = mid;
  }
  return low;
}

function fitAllStats() {
  const size = Math.min(...[...statTexts].map(largestFit));
  statTexts.forEach((box) => {
    box.style.fontSize = `${size}px`;
  });
}

new ResizeObserver(fitAllStats).observe(document.querySelector(".stats"));

document.fonts?.ready.then(fitAllStats);

function setStat(id, text) {
  const el = document.getElementById(id);
  if (el.textContent === text) return;
  el.textContent = text;
  fitAllStats();
}

function showTime() {
  setStat(
    "time",
    new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  );
}

showTime();
setInterval(showTime, 1000);

const VISITED_KEY = "luck-visited";

function alreadyCounted() {
  try {
    return localStorage.getItem(VISITED_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberCounted() {
  try {
    localStorage.setItem(VISITED_KEY, "1");
  } catch {}
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

const countThisVisit = !alreadyCounted();

fetch(`/api/stats${countThisVisit ? "?hit=1" : ""}`)
  .then((response) => {
    if (!response.ok) throw new Error(`stats returned ${response.status}`);
    return response.json();
  })
  .then((stats) => {
    setStat(
      "hitcount",
      stats.views != null ? Number(stats.views).toLocaleString("en-US") : "?",
    );
    setStat(
      "lastupdate",
      stats.lastUpdated ? formatDate(stats.lastUpdated) : "?",
    );
    if (countThisVisit && stats.counting) rememberCounted();
  })
  .catch((error) => {
    console.error("Could not load site stats:", error);
    setStat("hitcount", "?");
    setStat("lastupdate", "?");
  });
