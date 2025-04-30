// Updated bannerbar.js with adjustable animation speeds

// --- Banner Progress Bar Logic ---
const initBannerProgressBar = () => {
  const bannerProgressBar = document.querySelector(".banner");
  const swupInstance = window.swup;

  // Get CSS variables or use defaults if they don't exist
  const styles = getComputedStyle(document.documentElement);
  const shrinkDuration =
    styles.getPropertyValue("--banner-shrink-duration").trim() || "0.1s";
  const expandDuration =
    styles.getPropertyValue("--banner-expand-duration").trim() || "0.8s";

  if (!bannerProgressBar) {
    console.error("Banner progress bar element (.banner) not found.");
    return;
  }
  if (!swupInstance) {
    console.error(
      "Swup instance not found. Make sure it's assigned to window.swup."
    );
    return;
  }

  console.log("Initializing custom banner progress bar hooks...");
  console.log(
    `Using shrink duration: ${shrinkDuration}, expand duration: ${expandDuration}`
  );

  // Hook: Transition Starts
  swupInstance.hooks.on("transition:start", () => {
    console.log("transition:start - Shrinking banner");
    // Immediately shrink the banner to a small width
    bannerProgressBar.style.transitionDuration = shrinkDuration;
    bannerProgressBar.style.transform = "scaleX(0.05)"; // Shrink to 5%
    bannerProgressBar.style.opacity = "1"; // Ensure visible
    bannerProgressBar.classList.add("is-loading"); // Add loading class

    // Force reflow to ensure the style change is applied before setting new transition
    void bannerProgressBar.offsetWidth;

    // Set the transition for loading animation and start growth
    setTimeout(() => {
      console.log("transition:start - Starting growth animation");
      bannerProgressBar.style.transitionDuration = expandDuration; // Use the CSS variable
      bannerProgressBar.style.transitionProperty = "transform"; // Animate only transform
      bannerProgressBar.style.transform = "scaleX(1)"; // Animate to full width
    }, 50);
  });

  // Hook: Transition Ends
  swupInstance.hooks.on("transition:end", () => {
    console.log("transition:end - Resetting banner");
    bannerProgressBar.classList.remove("is-loading");
    // Ensure banner is fully scaled and visible
    bannerProgressBar.style.transitionProperty = "transform, opacity"; // Reset transition property
    bannerProgressBar.style.transitionDuration = shrinkDuration; // Reset to default duration
    bannerProgressBar.style.transform = "scaleX(1)";
    bannerProgressBar.style.opacity = "1";
  });

  // Hook: Transition Aborted
  swupInstance.hooks.on("transition:abort", () => {
    console.log("transition:abort - Resetting banner");
    bannerProgressBar.classList.remove("is-loading");
    bannerProgressBar.style.transitionProperty = "transform, opacity";
    bannerProgressBar.style.transitionDuration = shrinkDuration;
    bannerProgressBar.style.transform = "scaleX(1)";
    bannerProgressBar.style.opacity = "1";
  });

  // Hook: History Navigation (for back/forward buttons)
  swupInstance.hooks.on("navigate:history", () => {
    console.log("History navigation detected - Animating banner");
    // Same animation logic as transition:start for back/forward navigation
    bannerProgressBar.style.transitionDuration = shrinkDuration;
    bannerProgressBar.style.transform = "scaleX(0.05)";
    bannerProgressBar.style.opacity = "1";
    bannerProgressBar.classList.add("is-loading");

    void bannerProgressBar.offsetWidth;

    setTimeout(() => {
      bannerProgressBar.style.transitionDuration = expandDuration;
      bannerProgressBar.style.transitionProperty = "transform";
      bannerProgressBar.style.transform = "scaleX(1)";
    }, 50);
  });
};
// --- Script Re-initialization Logic ---

function initializeBnuuyHover() {
  const aboutLink = document.querySelector(".about-link");
  if (!aboutLink) {
    console.log("No .about-link found on page.");
    return;
  }

  // Remove any existing event listeners first to prevent duplicates
  if (aboutLink._listenersAttached) {
    console.log("Removing existing bnuuy listeners.");
    if (aboutLink._mouseEnterHandler) {
      aboutLink.removeEventListener("mouseenter", aboutLink._mouseEnterHandler);
    }
    if (aboutLink._mouseLeaveHandler) {
      aboutLink.removeEventListener("mouseleave", aboutLink._mouseLeaveHandler);
    }
    aboutLink._listenersAttached = false;
  }

  const defaultIcon = aboutLink.querySelector(".icon-default");
  const hoverIcon = aboutLink.querySelector(".icon-hover");

  if (defaultIcon && hoverIcon) {
    console.log("Attaching Bnuuy hover listeners.");

    const handleMouseEnter = () => {
      defaultIcon.style.display = "none";
      hoverIcon.style.display = "block";
    };

    const handleMouseLeave = () => {
      defaultIcon.style.display = "block";
      hoverIcon.style.display = "none";
    };

    aboutLink.addEventListener("mouseenter", handleMouseEnter);
    aboutLink.addEventListener("mouseleave", handleMouseLeave);

    // Store handlers for removal later
    aboutLink._mouseEnterHandler = handleMouseEnter;
    aboutLink._mouseLeaveHandler = handleMouseLeave;
    aboutLink._listenersAttached = true;

    // Ensure initial state
    defaultIcon.style.display = "block";
    hoverIcon.style.display = "none";
  } else {
    console.log("Bnuuy icons not found:", !!defaultIcon, !!hoverIcon);
  }
}

// Function to re-load external scripts
function loadScript(src, id) {
  const existingScript = document.getElementById(id);
  if (existingScript) {
    console.log(`Removing existing script: ${id}`);
    existingScript.remove();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.id = id;
    script.onload = () => {
      console.log(`Script loaded: ${src}`);
      resolve();
    };
    script.onerror = (err) => {
      console.error(`Error loading script: ${src}`, err);
      reject(err);
    };
    document.body.appendChild(script);
  });
}

async function initializePageScripts() {
  console.log("Running initializePageScripts for: " + window.location.pathname);

  // Re-run bnuuy hover initialization
  initializeBnuuyHover();

  // Add a slight delay to ensure DOM is fully processed
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Fix scrolling issues - ensure mainframe is scrollable
  const mainframe = document.querySelector(".mainframe");
  if (mainframe) {
    mainframe.style.overflowY = "scroll";
    console.log("Applied mainframe scroll");
  }

  // Ensure sideframes have proper overflow
  const sideframes = document.querySelectorAll(".sideframe");
  sideframes.forEach((frame) => {
    frame.style.overflowY = "auto";
    console.log("Applied sideframe overflow to a frame");
  });

  // Draw dotted line between sections in left sideframe
  if (window.location.pathname.includes("aboutme")) {
    console.log("Initializing AboutMe page specifics");

    const leftSections = document.querySelectorAll(".left-section");
    leftSections.forEach((section) => {
      if (!section.classList.contains("left-bottom-section")) {
        section.style.borderBottom = "1px dashed white";
        console.log("Applied dotted border to section");
      }
    });
  }

  // Re-run visitor/time scripts
  if (document.querySelector("#hitcount") || document.querySelector("#time")) {
    console.log("Found visitor/time elements, reloading scripts...");
    try {
      // Load scripts sequentially
      await loadScript("/lloadinfo.js", "lloadinfo-script");
      await loadScript("/time.js", "time-script");
    } catch (error) {
      console.error("Error reloading page scripts:", error);
    }
  } else {
    console.log("Visitor/time elements not found.");
  }
}

// --- Swup Hook for Re-initialization ---
function attachSwupHooks() {
  if (window.swup) {
    console.log("Attaching Swup hooks.");

    // Hook for content replaced - may need to fix some elements immediately
    window.swup.hooks.on("content:replace", () => {
      console.log("content:replace hook triggered");
    });

    // Hook runs *after* the new page content is in the DOM and animations are finished
    window.swup.hooks.on("page:view", (visit) => {
      console.log("page:view hook triggered for", window.location.pathname);
      // Use setTimeout to ensure DOM is fully settled after transition
      setTimeout(initializePageScripts, 50);
    });

    // Also run init on initial load *after* swup is ready
    setTimeout(initializePageScripts, 100);
  } else {
    console.error("Swup not initialized when trying to attach hooks.");
  }
}

// --- Main Execution ---
// Initialize the banner logic as soon as possible
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");

  // Wait a moment to ensure Swup is initialized
  setTimeout(() => {
    if (window.swup) {
      console.log("Swup found, initializing banner and hooks");
      initBannerProgressBar();
      attachSwupHooks();
    } else {
      console.warn("Swup not found after DOMContentLoaded, waiting more...");

      // Try again after a bit longer
      setTimeout(() => {
        if (window.swup) {
          console.log("Swup found on retry, initializing");
          initBannerProgressBar();
          attachSwupHooks();
        } else {
          console.error(
            "Swup still not available. Banner animations won't work."
          );
        }
      }, 500);
    }
  }, 100);
});

// Also initialize on window load as a fallback
window.addEventListener("load", () => {
  console.log("Window loaded");

  if (!window.swup) {
    console.error(
      "Swup not found on window load. Banner animations won't work."
    );
  } else if (
    !document.querySelector(".banner")?.classList.contains("is-loading")
  ) {
    // Only initialize if not already done
    console.log("Initializing on window load (fallback)");
    initBannerProgressBar();
    attachSwupHooks();

    // Also run the page scripts initialization
    initializePageScripts();
  }
});
