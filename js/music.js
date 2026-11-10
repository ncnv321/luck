const FADE_MS = 600;

const player = document.getElementById("player");
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const coverEl = document.getElementById("cover");
const infoEl = document.getElementById("songInfo");
const nowPlaying = document.getElementById("nowPlaying");
const spotifyLink = document.getElementById("spotifyLink");
const progressFill = document.getElementById("progressFill");

let tracks = [];
let order = [];
let position = -1;
let failures = 0;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function shuffle(count) {
  const list = [...Array(count).keys()];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function describe(track) {
  return track.album
    ? `${track.artist} - ${track.album}; ${track.title}`
    : `${track.artist}; ${track.title}`;
}

function setPlaying(isPlaying) {
  player.classList.toggle("is-playing", isPlaying);
  playBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
}

async function showTrack(track) {
  nowPlaying.classList.add("is-changing");
  await wait(FADE_MS);
  infoEl.textContent = describe(track);
  if (track.cover) coverEl.src = track.cover;
  else coverEl.removeAttribute("src");
  coverEl.alt = track.album ? `${track.album} cover` : "";
  spotifyLink.href = track.spotify || "#";
  spotifyLink.hidden = !track.spotify;
  nowPlaying.classList.remove("is-changing");
}

async function go(step) {
  if (!tracks.length) return;
  position = (position + step + order.length) % order.length;
  if (step > 0 && position === 0) order = shuffle(tracks.length);
  const track = tracks[order[position]];

  progressFill.style.width = "0%";
  const fade = showTrack(track);
  audio.src = track.preview;

  try {
    await audio.play();
    failures = 0;
  } catch (error) {
    if (error.name === "NotAllowedError") {
      setPlaying(false);
      return;
    }
    failures += 1;
    await fade;
    if (failures >= 5) {
      setPlaying(false);
      infoEl.textContent = "couldn't play any songs right now :(";
      return;
    }
    go(step >= 0 ? 1 : -1);
  }
}

playBtn.addEventListener("click", () => {
  if (position === -1) go(1);
  else if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
});

document.getElementById("nextBtn").addEventListener("click", () => go(1));
document.getElementById("prevBtn").addEventListener("click", () => go(-1));

audio.addEventListener("play", () => setPlaying(true));
audio.addEventListener("pause", () => setPlaying(false));
audio.addEventListener("ended", () => go(1));
audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    progressFill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  }
});

fetch("/data/tracks.json")
  .then((response) => response.json())
  .then((data) => {
    tracks = (data.tracks || []).filter((track) => track.preview);
    order = shuffle(tracks.length);
  })
  .catch(() => {
    infoEl.textContent = "couldn't load the songs :(";
  });
