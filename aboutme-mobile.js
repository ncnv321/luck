/**
 * aboutme-mobile.js - Simplified fix for About Me page
 */

// Create and insert styles immediately
(function () {
  // Create style element
  const styleElement = document.createElement("style");
  styleElement.id = "aboutme-mobile-fix";
  styleElement.innerHTML = `
    /* Desktop styles */
    @media screen and (min-width: 768px) {
      .mainwrapper > div {
        display: flex !important;
      }
      
      .sideframe.left-sideframe {
        width: 175px !important;
      }
      
      .mainframe {
        width: 510px !important;
      }
      
      .sideframe:not(.left-sideframe) {
        width: 175px !important;
      }
      
      /* Fix icon sizes on desktop too */
      .quick-links img {
        height: 15px !important;
        width: auto !important;
      }
    }
    
    /* Mobile styles */
    @media screen and (max-width: 767px) {
      /* Stack layout vertically */
      .mainwrapper > div {
        display: block !important;
      }
      
      /* Fix all frames */
      .sideframe, .mainframe {
        width: 100% !important;
        height: auto !important;
        margin: 0 0 10px 0 !important;
        overflow: visible !important;
      }
      
      /* Fix changelog/kins box */
      .changelog {
        width: 90% !important;
        max-width: 300px !important;
        margin: 0 auto 10px auto !important;
        height: 80px !important;
        overflow: hidden !important;
        border: 1px solid white !important;
      }
      
      /* Fix marquee */
      .changelog marquee {
        white-space: nowrap !important;
        height: 80px !important;
        display: flex !important;
        align-items: center !important;
      }
      
      /* Fix images in kins marquee */
      .changelog img {
        height: 80px !important;
        width: auto !important;
        display: inline-block !important;
        vertical-align: middle !important;
        margin: 0 5px !important;
        object-fit: contain !important;
      }
      
      /* Fix likes/dislikes box */
      .likes-dislikes {
        width: 90% !important;
        max-width: 300px !important;
        margin: 0 auto 10px auto !important;
      }
      
      /* Fix icon sizes */
      .quick-links img {
        height: 15px !important;
        width: auto !important;
        max-height: 15px !important;
        vertical-align: middle !important;
      }
    }
  `;

  // Add to document immediately - at the TOP of head for highest priority
  if (document.head) {
    document.head.insertBefore(styleElement, document.head.firstChild);
  } else {
    // If head isn't available yet, wait for it
    document.addEventListener("DOMContentLoaded", function () {
      document.head.insertBefore(styleElement, document.head.firstChild);
    });
  }

  // Apply direct styles to elements as they appear
  function fixElements() {
    // Fix icon sizes immediately
    const icons = document.querySelectorAll(".quick-links img");
    icons.forEach((icon) => {
      icon.style.setProperty("height", "15px", "important");
      icon.style.setProperty("width", "auto", "important");
      icon.style.setProperty("max-height", "15px", "important");
    });

    // Fix changelog box
    const changelog = document.querySelector(".changelog");
    if (changelog && window.innerWidth <= 767) {
      changelog.style.setProperty("height", "80px", "important");
      changelog.style.setProperty("overflow", "hidden", "important");
    }

    // Fix marquee
    const marquee = document.querySelector(".changelog marquee");
    if (marquee && window.innerWidth <= 767) {
      marquee.style.setProperty("height", "80px", "important");
      marquee.style.setProperty("display", "flex", "important");
      marquee.style.setProperty("align-items", "center", "important");
    }
  }

  // Run on load and whenever DOM changes
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixElements);
  } else {
    fixElements();
  }

  window.addEventListener("load", fixElements);
  window.addEventListener("resize", fixElements);

  // Try to run multiple times during page load
  setTimeout(fixElements, 0);
  setTimeout(fixElements, 100);
  setTimeout(fixElements, 500);
})();
