// Create a global function to handle style application and layout
window.applyPageStyles = function () {
  console.log("Applying page styles and fixing layout");

  // Detect if we're on the art gallery page
  const isArtGallery = window.location.pathname.includes("/art.html");

  if (isArtGallery) {
    console.log("Art Gallery page detected - applying specific layout");

    // Find the right sideframe and camouflage it
    const sideframes = document.querySelectorAll(".sideframe");
    if (sideframes.length > 1) {
      const rightSideframe = sideframes[sideframes.length - 1];
      if (!rightSideframe.classList.contains("left-sideframe")) {
        rightSideframe.classList.add("art-gallery-right-sideframe");
        rightSideframe.style.width = "5px";
        rightSideframe.style.borderLeft = "none";
        rightSideframe.style.backgroundColor = "black";
        rightSideframe.style.opacity = "0";
        rightSideframe.style.pointerEvents = "none";
      }
    }

    // Ensure mainframe has the proper width
    const mainframe = document.querySelector(".mainframe");
    if (mainframe) {
      mainframe.style.width = "680px";
      mainframe.style.overflowY = "scroll";
    }
  } else {
    // Standard layout for other pages - restore normal dimensions
    console.log("Regular page layout applied");

    // Reset mainframe to standard width
    const mainframe = document.querySelector(".mainframe");
    if (mainframe) {
      mainframe.style.width = "510px"; // Standard width for 3-column layout
      mainframe.style.overflowY = "scroll";
    }

    // Reset all sideframes to normal state
    const sideframes = document.querySelectorAll(".sideframe");
    sideframes.forEach((frame) => {
      // Remove any gallery-specific classes
      frame.classList.remove("art-gallery-right-sideframe");

      // Reset styles for right sideframe
      if (!frame.classList.contains("left-sideframe")) {
        frame.style.width = "175px";
        frame.style.borderLeft = "1px solid white";
        frame.style.backgroundColor = "";
        frame.style.opacity = "1";
        frame.style.pointerEvents = "auto";
      }
    });
  }

  // Fix mainframe scroll for all pages
  const mainframe = document.querySelector(".mainframe");
  if (mainframe) {
    mainframe.style.overflowY = "scroll";
    console.log("Set mainframe scroll");
  }

  // Ensure proper dotted borders in left sections
  const leftSections = document.querySelectorAll(
    ".left-section:not(.left-bottom-section)"
  );
  leftSections.forEach((section) => {
    section.style.borderBottom = "1px dashed white";
  });

  // Initialize bnuuy hover effect
  initBnuuyHover();

  // Load visitor counts and time
  if (document.querySelector("#hitcount") || document.querySelector("#time")) {
    console.log("Loading visitor info");
    // Load scripts after a small delay
    setTimeout(() => {
      // Remove old scripts if they exist
      const oldInfoScript = document.getElementById("info-script");
      const oldTimeScript = document.getElementById("time-script");
      if (oldInfoScript) oldInfoScript.remove();
      if (oldTimeScript) oldTimeScript.remove();

      // Add fresh scripts
      const infoScript = document.createElement("script");
      infoScript.src = "/lloadinfo.js";
      infoScript.id = "info-script";
      document.body.appendChild(infoScript);

      const timeScript = document.createElement("script");
      timeScript.src = "/time.js";
      timeScript.id = "time-script";
      document.body.appendChild(timeScript);
    }, 50);
  }
};

// Initialize bnuuy hover effect
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

// Animate the banner with a fixed duration
function animateBanner() {
  const banner = document.querySelector(".banner");
  if (!banner) return;

  console.log("Starting banner animation with fixed 3-second duration");

  // Reset to initial state with no transition
  banner.style.transition = "none";
  banner.style.transform = "scaleX(0.05)";

  // Force reflow to ensure style changes are applied
  void banner.offsetHeight;

  // Set the explicit animation duration (3 seconds = 3000ms)
  banner.style.transition = "transform 3000ms cubic-bezier(0.1, 0.7, 0.1, 1)";
  banner.style.transform = "scaleX(1)";
}

// Apply page-specific layouts after each navigation
function handlePageChange() {
  console.log("Handling page change");
  setTimeout(window.applyPageStyles, 100);
}

// Set up the initial event listeners when the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded - setting up page");

  // Apply initial styles
  window.applyPageStyles();

  // Run initial banner animation
  animateBanner();

  // Check if Swup is available and set up hooks
  if (window.swup) {
    console.log("Setting up Swup hooks");

    // When page content is replaced
    window.swup.hooks.on("content:replace", function () {
      console.log("Content replaced - animating banner");
      animateBanner();
      handlePageChange();
    });

    // When history navigation happens (back/forward)
    window.swup.hooks.on("navigate:history", function () {
      console.log("History navigation - animating banner");
      animateBanner();
      handlePageChange();
    });

    // After page transition is complete
    window.swup.hooks.on("page:view", function () {
      console.log("Page view - applying styles");
      handlePageChange();
    });
  } else {
    console.warn("Swup not found on DOMContentLoaded");
  }
});

// Monitor for URL changes to catch any missed transitions
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log("URL changed - applying layout fixes");
    setTimeout(handlePageChange, 150);
  }
}).observe(document, { subtree: true, childList: true });
