// Global variables
let allArtworks = [];
let galleryInitialized = false;

// Main initialization function
function initGallery() {
  console.log("Initializing gallery");

  // Only initialize once per page load
  if (galleryInitialized && document.querySelector(".artworks .thumbnail")) {
    console.log("Gallery already fully initialized and loaded");
    return;
  }

  // Only run on art gallery page
  if (!window.location.pathname.includes("/art.html")) {
    console.log("Not on art gallery page");
    return;
  }

  console.log("Setting up gallery components");

  // Initialize client if needed
  initSanityClient();

  // Setup filters
  setupFilters();

  // Initialize bunny hover effect
  initBnuuyHover();

  // Load content with a delay to ensure dependencies are loaded
  setTimeout(loadGalleryContent, 300);

  // Mark as initialized
  galleryInitialized = true;
}

// Initialize Sanity client
function initSanityClient() {
  // Check if we already have a client
  if (window.sanityClient) {
    console.log("Sanity client already initialized");
    return;
  }

  // Try direct initialization if SanityClient is available
  if (typeof SanityClient !== "undefined") {
    window.sanityClient = new SanityClient({
      projectId: "asrslodd",
      dataset: "production",
      apiVersion: "2025-05-03",
      useCdn: true,
    });
    console.log("Sanity client initialized via global SanityClient");
    return;
  }

  // Try ESM import approach if available
  if (typeof window.createClient !== "undefined") {
    window.sanityClient = window.createClient({
      projectId: "asrslodd",
      dataset: "production",
      apiVersion: "2025-05-03",
      useCdn: true,
    });
    console.log("Sanity client initialized via ESM createClient");
    return;
  }

  console.warn("Could not initialize Sanity client - missing dependencies");
}

// Setup filter functionality
function setupFilters() {
  console.log("Setting up filters");

  const filterButton = document.getElementById("applyFilters");
  if (!filterButton) {
    console.log("Filter button not found");
    return;
  }

  // Remove any existing listeners to prevent duplicates
  const newFilterButton = filterButton.cloneNode(true);
  filterButton.parentNode.replaceChild(newFilterButton, filterButton);

  // Add event listener
  newFilterButton.addEventListener("click", function () {
    const yearFilter = document.getElementById("yearFilter").value;
    console.log(`Filtering by year: ${yearFilter}`);

    // Filter artworks
    let filteredArtworks = allArtworks;

    if (yearFilter !== "all") {
      filteredArtworks = filteredArtworks.filter(
        (artwork) => artwork.category === yearFilter
      );
    }

    // Render filtered gallery
    renderGallery(filteredArtworks);
  });
}

// Initialize bunny hover effect
function initBnuuyHover() {
  const aboutLink = document.querySelector(".about-link");
  if (!aboutLink) return;

  const defaultIcon = aboutLink.querySelector(".icon-default");
  const hoverIcon = aboutLink.querySelector(".icon-hover");

  if (defaultIcon && hoverIcon) {
    // Remove existing event listeners to prevent duplicates
    aboutLink.removeEventListener("mouseenter", aboutLink._mouseEnterHandler);
    aboutLink.removeEventListener("mouseleave", aboutLink._mouseLeaveHandler);

    // Create handler functions
    aboutLink._mouseEnterHandler = function () {
      defaultIcon.style.display = "none";
      hoverIcon.style.display = "block";
    };

    aboutLink._mouseLeaveHandler = function () {
      defaultIcon.style.display = "block";
      hoverIcon.style.display = "none";
    };

    // Add event listeners
    aboutLink.addEventListener("mouseenter", aboutLink._mouseEnterHandler);
    aboutLink.addEventListener("mouseleave", aboutLink._mouseLeaveHandler);

    // Set initial state
    defaultIcon.style.display = "block";
    hoverIcon.style.display = "none";
  }
}

// Load gallery content
function loadGalleryContent() {
  console.log("Loading gallery content");

  // Get container
  const artworksContainer = document.querySelector(".artworks");
  if (!artworksContainer) {
    console.error("Artworks container not found");
    return;
  }

  // If we already have artworks in the DOM, no need to fetch them again
  if (document.querySelector(".artworks .thumbnail")) {
    console.log("Gallery already has content - skipping fetch");
    return;
  }

  // Show loading indicator
  artworksContainer.innerHTML =
    '<div class="loading-indicator">Loading gallery...</div>';

  // Check for Sanity client
  if (!window.sanityClient) {
    console.error("Sanity client not available");
    artworksContainer.innerHTML =
      '<div class="error-message">Unable to load gallery. Sanity client not available. Try refreshing the page.</div>';
    return;
  }

  try {
    // Query to fetch artworks
    const query = `*[_type == "artwork"] {
      _id,
      title,
      "imageUrl": image.asset->url,
      year,
      description,
      category
    } | order(year desc)`;

    console.log("Fetching artworks from Sanity");

    // Fetch artworks
    window.sanityClient
      .fetch(query)
      .then((artworks) => {
        console.log(`Fetched ${artworks.length} artworks`);

        // Store for filtering
        allArtworks = artworks;

        // Render gallery
        renderGallery(artworks);
      })
      .catch((error) => {
        console.error("Error fetching artworks:", error);
        artworksContainer.innerHTML =
          '<div class="error-message">Error loading gallery. Please try again later.</div>';
      });
  } catch (error) {
    console.error("Exception in gallery script:", error);
    artworksContainer.innerHTML =
      '<div class="error-message">An error occurred while setting up the gallery. Please check the console for details.</div>';
  }
}

// Render gallery with artworks
function renderGallery(artworks) {
  console.log("Rendering gallery");

  // Get container
  const artworksContainer = document.querySelector(".artworks");
  if (!artworksContainer) return;

  // If no artworks, show message
  if (!artworks || artworks.length === 0) {
    artworksContainer.innerHTML =
      '<div class="loading-indicator">No artworks found that match your filters.</div>';
    return;
  }

  // Group by category
  const categories = {};
  artworks.forEach((artwork) => {
    if (!categories[artwork.category]) {
      categories[artwork.category] = [];
    }
    categories[artwork.category].push(artwork);
  });

  // Clear container
  artworksContainer.innerHTML = "";

  // Categories to display in order
  const orderedCategories = ["2025", "2024", "2023", "2022", "sketches"];

  // Create sections for each category
  orderedCategories.forEach((category) => {
    if (!categories[category] || categories[category].length === 0) {
      return; // Skip empty categories
    }

    // Create year section
    const yearSection = document.createElement("div");
    yearSection.className = "year-section";
    yearSection.id = `year-${category}`;

    // Add header
    const header = document.createElement("h2");
    header.style.textAlign = "center";
    header.style.borderBottom = "1px dashed white";
    header.style.paddingBottom = "5px";
    header.style.margin = "20px 0 15px 0";
    yearSection.appendChild(header);

    // Create thumbnail grid
    const thumbnailGrid = document.createElement("div");
    thumbnailGrid.className = "thumbnail-grid";
    thumbnailGrid.style.display = "grid";
    thumbnailGrid.style.gridTemplateColumns =
      "repeat(auto-fill, minmax(90px, 1fr))";
    thumbnailGrid.style.gap = "15px";
    thumbnailGrid.style.marginBottom = "25px";

    // Add each artwork to the grid
    categories[category].forEach((artwork) => {
      const thumbnail = document.createElement("div");
      thumbnail.className = "thumbnail";

      const link = document.createElement("a");
      link.href = artwork.imageUrl;
      link.dataset.description = artwork.description || "";

      const image = document.createElement("img");
      image.src = `${artwork.imageUrl}?w=90&h=90&fit=crop`;
      image.alt = artwork.title;
      image.title = artwork.title;
      image.setAttribute("loading", "lazy");
      image.style.maxWidth = "90px";
      image.style.maxHeight = "90px";
      image.style.width = "100%";
      image.style.height = "auto";
      image.style.aspectRatio = "1 / 1";
      image.style.objectFit = "cover";

      link.appendChild(image);
      thumbnail.appendChild(link);
      thumbnailGrid.appendChild(thumbnail);
    });

    yearSection.appendChild(thumbnailGrid);
    artworksContainer.appendChild(yearSection);
  });

  // Initialize lightbox
  setTimeout(initLightbox, 100);
}

// Initialize lightbox
function initLightbox() {
  if (typeof SimpleLightbox === "undefined") {
    console.warn("SimpleLightbox not available");
    return;
  }

  // Check for existing lightbox
  if (document.querySelector(".sl-overlay")) {
    console.log("Lightbox already initialized");
    return;
  }

  console.log("Initializing lightbox");

  // Create new lightbox
  new SimpleLightbox(".thumbnail a", {
    captionsData: "description",
    captionDelay: 0,
    captionPosition: "bottom",
    animationSpeed: 300,
    fadeSpeed: 300,
    overlay: true,
    overlayOpacity: 0.9,
    navText: ["←", "→"],
    closeText: "×",
    showCounter: false,
  });
}

// Event handlers for page transition events
function setupEventListeners() {
  console.log("Setting up event listeners");

  // Handle regular page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (window.location.pathname.includes("/art.html")) {
        setTimeout(initGallery, 300);
      }
    });
  } else {
    // DOM already loaded
    if (window.location.pathname.includes("/art.html")) {
      setTimeout(initGallery, 300);
    }
  }

  // Handle Swup transitions
  document.addEventListener("swup:contentReplaced", function () {
    console.log("Swup content replaced - checking for art gallery");
    if (window.location.pathname.includes("/art.html")) {
      setTimeout(initGallery, 500);
    }
  });

  // Also listen for conventional page transition events
  window.addEventListener("popstate", function () {
    console.log("Popstate event - checking for art gallery");
    if (window.location.pathname.includes("/art.html")) {
      setTimeout(initGallery, 300);
    }
  });
}

// Initialize on script load
setupEventListeners();

// Provide a global reset function that can be called manually if needed
window.resetGallery = function () {
  console.log("Manual gallery reset requested");
  galleryInitialized = false;
  allArtworks = [];
  initGallery();
};
