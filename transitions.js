/**
 * transitions.js - Complete page fade transitions for luck's website
 */

// Execute as soon as possible
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded - initializing fade transitions");

  // Create and add our fade overlay to the DOM immediately
  createFadeOverlay();

  // Start with the overlay visible (black screen)
  const fadeOverlay = document.getElementById("fade-overlay");
  fadeOverlay.style.opacity = "1";

  // Initialize other components
  initBannerAnimation();
  initBnuuyHover();
  applyGlobalStyles();

  // Fade in the page after a short delay
  setTimeout(function () {
    fadeOverlay.style.opacity = "0";
    console.log("Page faded in");
  }, 100);

  // Set up link click handlers
  document.addEventListener("click", handleLinkClicks);
});

/**
 * Create the fade overlay element
 */
function createFadeOverlay() {
  // Create fade overlay if it doesn't exist
  if (!document.getElementById("fade-overlay")) {
    // Create the overlay
    const overlay = document.createElement("div");
    overlay.id = "fade-overlay";

    // Style the overlay
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "#000";
    overlay.style.zIndex = "9999";
    overlay.style.opacity = "0"; // Start invisible
    overlay.style.pointerEvents = "none"; // Allow clicks to pass through
    overlay.style.transition = "opacity 0.4s ease-in-out";

    // Keep the banner visible above the overlay
    const banner = document.querySelector(".banner");
    if (banner) {
      banner.style.position = "relative";
      banner.style.zIndex = "10000"; // Above the overlay
    }

    // Add it to the document
    document.body.appendChild(overlay);

    console.log("Fade overlay created");
  }
}

/**
 * Handle link clicks for page transitions
 */
function handleLinkClicks(e) {
  // Find if we clicked on a link or a child of a link
  let target = e.target;
  while (target && target.tagName !== "A") {
    target = target.parentNode;
    if (!target || target === document) return;
  }

  // Now target is an A element or null
  if (!target) return;

  // Only handle links to other pages on your site
  if (
    target.href &&
    target.href.startsWith(window.location.origin) &&
    !target.target && // Skip links that open in new tabs
    !target.hasAttribute("data-no-transition") && // Skip links with this attribute
    !target.href.includes("#") && // Skip anchor links
    !(target.href === window.location.href)
  ) {
    // Skip reload links

    e.preventDefault();
    const targetUrl = target.href;

    // Show the fade overlay (makes screen black)
    const fadeOverlay = document.getElementById("fade-overlay");
    if (fadeOverlay) {
      fadeOverlay.style.opacity = "1";
      console.log("Fade-out transition started");

      // Navigate after transition
      setTimeout(function () {
        console.log("Navigating to", targetUrl);
        window.location.href = targetUrl;
      }, 400); // Match your transition duration
    } else {
      // If overlay doesn't exist for some reason, navigate immediately
      window.location.href = targetUrl;
    }
  }
}

/**
 * Initialize banner animation
 */
function initBannerAnimation() {
  const banner = document.querySelector(".banner");
  if (!banner) return;

  // Add CSS if not already in the document
  if (!document.getElementById("banner-animation-styles")) {
    const style = document.createElement("style");
    style.id = "banner-animation-styles";
    style.textContent = `
      /* Banner animation (CSS-only) */
      @keyframes expandBanner {
        from { transform: scaleX(0.05); }
        to { transform: scaleX(1); }
      }
      
      .banner {
        transform-origin: left center;
        animation: expandBanner 3s cubic-bezier(0.1, 0.7, 0.1, 1) forwards;
      }
    `;
    document.head.appendChild(style);
  }

  console.log("Banner animation initialized");
}

/**
 * Initialize bunny hover effect
 */
function initBnuuyHover() {
  const aboutLink = document.querySelector(".about-link");
  if (!aboutLink) return;

  const defaultIcon = aboutLink.querySelector(".icon-default");
  const hoverIcon = aboutLink.querySelector(".icon-hover");

  if (defaultIcon && hoverIcon) {
    // Prevent duplicate event listeners
    aboutLink.removeEventListener("mouseenter", showHoverIcon);
    aboutLink.removeEventListener("mouseleave", showDefaultIcon);

    aboutLink.addEventListener("mouseenter", showHoverIcon);
    aboutLink.addEventListener("mouseleave", showDefaultIcon);

    // Make sure initial state is correct
    defaultIcon.style.display = "block";
    hoverIcon.style.display = "none";

    console.log("Bunny hover effect initialized");
  }

  function showHoverIcon() {
    defaultIcon.style.display = "none";
    hoverIcon.style.display = "block";
  }

  function showDefaultIcon() {
    defaultIcon.style.display = "block";
    hoverIcon.style.display = "none";
  }
}

/**
 * Apply global styles to ensure consistent look across pages
 */
function applyGlobalStyles() {
  // Force all dotted borders
  document
    .querySelectorAll(".left-section:not(.left-bottom-section)")
    .forEach((section) => {
      section.style.borderBottom = "1px dashed white";
    });

  // Force all paragraph margins
  document.querySelectorAll("p").forEach((p) => {
    p.style.marginTop = "0.5em";
    p.style.marginBottom = "0.5em";
  });

  // Ensure mainframe is scrollable
  const mainframe = document.querySelector(".mainframe");
  if (mainframe) {
    mainframe.style.overflowY = "scroll";
  }

  // Apply page-specific styles based on URL
  applyPageSpecificStyles();
}

/**
 * Apply styles specific to the current page
 */
function applyPageSpecificStyles() {
  // Art gallery page
  if (window.location.pathname.includes("/art.html")) {
    console.log("Art gallery page detected - applying specific styles");

    // Make right sideframe invisible
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

    // Ensure mainframe is the right size
    const mainframe = document.querySelector(".mainframe");
    if (mainframe) {
      mainframe.style.width = "680px";
    }
  }

  // About me page
  if (window.location.pathname.includes("/aboutme.html")) {
    console.log("About Me page detected - applying specific styles");

    // Main content paragraph
    const mainParagraph = document.querySelector("#paragraphstyling2");
    if (mainParagraph) {
      mainParagraph.style.textAlign = "left";
      mainParagraph.style.lineHeight = "1.4";
      mainParagraph.style.margin = "15px";
    }

    // Likes/dislikes box
    const likesBox = document.querySelector(".likes-dislikes");
    if (likesBox) {
      likesBox.style.border = "1px solid white";
      likesBox.style.padding = "5px";
      likesBox.style.minHeight = "120px";
      likesBox.style.overflowY = "auto";
      likesBox.style.marginBottom = "10px";
      likesBox.style.textAlign = "left";
    }

    // Changelog paragraph in likes/dislikes
    const changelogParagraph = document.querySelector(
      "#changelogparagraphstyling"
    );
    if (changelogParagraph) {
      changelogParagraph.style.textAlign = "left";
      changelogParagraph.style.lineHeight = "1.3";
      changelogParagraph.style.margin = "9px";
    }

    // Ensure marquee has proper styling
    const kinsMarquee = document.querySelector(".changelog");
    if (kinsMarquee) {
      kinsMarquee.style.height = "80px";
      kinsMarquee.style.overflowY = "hidden";
      kinsMarquee.style.border = "1px solid white";
      kinsMarquee.style.marginBottom = "10px";
      kinsMarquee.style.width = "150px";
    }
  }
}
