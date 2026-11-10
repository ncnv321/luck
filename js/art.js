const SANITY_URL =
  "https://asrslodd.apicdn.sanity.io/v2025-05-03/data/query/production";

const ARTWORK_QUERY = `*[_type == "artwork"] {
  _id,
  title,
  "imageUrl": image.asset->url,
  year,
  description,
  category,
  medium,
  characters
} | order(year desc)`;

const CATEGORY_ORDER = ["2026", "2025", "2024", "2023", "2022", "sketches"];

const THUMB_SIZE = 600;

const FULL_SIZE = 1800;

let allArtworks = [];
let lightbox = null;

function extractDateFromDescription(description) {
  if (!description) return null;
  const match = description.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;
  const [, month, day, year] = match.map(Number);
  return new Date(year, month - 1, day);
}

function sortArtworksByDate(artworks) {
  return [...artworks].sort((a, b) => {
    const dateA = extractDateFromDescription(a.description);
    const dateB = extractDateFromDescription(b.description);
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB - dateA;
  });
}

function showMessage(text, isError) {
  const container = document.querySelector(".artworks");
  container.innerHTML = "";
  const message = document.createElement("div");
  message.className = "gallery-message" + (isError ? " is-error" : "");
  message.textContent = text;
  container.appendChild(message);
}

function buildCaption(artwork) {
  const parts = [];
  if (artwork.title) parts.push(artwork.title);
  if (artwork.description) parts.push(artwork.description);
  if (artwork.medium) parts.push("Medium: " + artwork.medium);
  if (artwork.characters && artwork.characters.length) {
    parts.push("Characters: " + artwork.characters.join(", "));
  }
  return parts.join("\n\n");
}

function renderGallery(artworks) {
  const container = document.querySelector(".artworks");

  if (!artworks.length) {
    showMessage("No artworks that match the filters just yet!");
    return;
  }

  const categories = {};
  artworks.forEach((artwork) => {
    (categories[artwork.category] ||= []).push(artwork);
  });

  container.innerHTML = "";

  CATEGORY_ORDER.forEach((category) => {
    const items = categories[category];
    if (!items || !items.length) return;

    const section = document.createElement("div");
    section.className = "year-section";
    section.id = `year-${category}`;

    const header = document.createElement("h2");
    header.className = "year-heading";
    header.textContent =
      category === "sketches" ? "Sketches & Scraps" : category;
    section.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "thumbnail-grid";

    sortArtworksByDate(items).forEach((artwork) => {
      const link = document.createElement("a");
      link.className = "thumbnail";
      link.href = `${artwork.imageUrl}?w=${FULL_SIZE}&h=${FULL_SIZE}&fit=max&auto=format`;
      link.dataset.caption = buildCaption(artwork);
      link.dataset.noTransition = "";

      const image = document.createElement("img");
      image.src = `${artwork.imageUrl}?w=${THUMB_SIZE}&h=${THUMB_SIZE}&fit=crop&auto=format`;
      image.alt = artwork.title || "Artwork";
      image.loading = "lazy";

      link.appendChild(image);
      grid.appendChild(link);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });

  container.scrollTop = 0;
  initLightbox();
}

function applyFilters() {
  const year = document.getElementById("yearFilter").value;
  const medium = document.getElementById("mediumFilter").value;
  const character = document.getElementById("characterFilter").value;

  const filtered = allArtworks.filter(
    (artwork) =>
      (year === "all" || artwork.category === year) &&
      (medium === "all" || artwork.medium === medium) &&
      (character === "all" || (artwork.characters || []).includes(character)),
  );

  renderGallery(filtered);
}

const descToggle = document.getElementById("descToggle");
const descPanel = document.getElementById("descPanel");

function hideDescription() {
  descPanel.hidden = true;
  descToggle.textContent = "View Description";
}

function updateDescriptionControls() {
  const link = lightbox.relatedElements[lightbox.currentImageIndex];
  const caption = link ? link.dataset.caption : "";

  descPanel.textContent = caption || "";
  hideDescription();
  descToggle.hidden = !caption;
}

function closeDescriptionControls() {
  hideDescription();
  descToggle.hidden = true;
}

descToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  const opening = descPanel.hidden;
  descPanel.hidden = !opening;
  descToggle.textContent = opening ? "Hide Description" : "View Description";
});

function initLightbox() {
  if (typeof SimpleLightbox === "undefined") {
    console.error("SimpleLightbox not available");
    return;
  }

  if (lightbox) lightbox.destroy();

  lightbox = new SimpleLightbox(".thumbnail", {
    captions: false,
    showCounter: false,
    closeText: "×",
    navText: ["←", "→"],
    docClose: true,
    disableScroll: true,
    history: false,
    loop: true,
    widthRatio: 0.9,
    heightRatio: 0.8,
    doubleTapZoom: 2,
    maxZoom: 10,
    scrollZoom: true,
    scrollZoomFactor: 0.5,
    fadeSpeed: 300,
    animationSpeed: 250,
  });

  lightbox.on("shown.simplelightbox", updateDescriptionControls);
  lightbox.on("changed.simplelightbox", updateDescriptionControls);
  lightbox.on("close.simplelightbox", closeDescriptionControls);
}

document.getElementById("applyFilters").addEventListener("click", applyFilters);

fetch(`${SANITY_URL}?query=${encodeURIComponent(ARTWORK_QUERY)}`)
  .then((response) => {
    if (!response.ok) throw new Error(`Sanity returned ${response.status}`);
    return response.json();
  })
  .then((data) => {
    allArtworks = data.result || [];
    renderGallery(allArtworks);
  })
  .catch((error) => {
    console.error("Error fetching artworks:", error);
    showMessage("Error loading gallery. Please try again later.", true);
  });
