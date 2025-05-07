/**
 * journal-mobile.js - Journal page-specific mobile fixes
 * Add this file to your website and include it in journal.html
 */

// Wait until DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Only apply fixes to journal.html page
  if (window.location.pathname.includes("journal.html")) {
    console.log("Journal page detected - applying specific fixes");

    // Create and append journal specific styles
    const styleElement = document.createElement("style");
    styleElement.id = "journal-responsive-fix";
    styleElement.innerHTML = `
      /* DESKTOP STYLES - Ensure flex layout is preserved */
      @media screen and (min-width: 768px) {
        /* Force horizontal layout on desktop */
        .mainwrapper > div {
          display: flex !important;
        }
        
        /* Correct widths for all frames */
        .sideframe.left-sideframe {
          width: 175px !important;
          flex-shrink: 0 !important;
          flex-basis: 175px !important;
        }
        
        .mainframe {
          width: 510px !important;
          flex-grow: 1 !important;
          flex-basis: 510px !important;
        }
        
        .sideframe:not(.left-sideframe) {
          width: 175px !important;
          flex-shrink: 0 !important;
          flex-basis: 175px !important;
        }
        
        /* Force proper text spacing */
        p {
          margin-top: 0.5em !important;
          margin-bottom: 0.5em !important;
        }
        
        /* Fix icon sizes on desktop too */
        .quick-links img {
          height: 15px !important;
          width: auto !important;
        }
      }

      /* MOBILE STYLES - Only apply on small screens */
      @media screen and (max-width: 767px) {
        /* Force layout to stack vertically */
        .mainwrapper > div {
          display: block !important;
        }
        
        /* Fix all frames */
        .sideframe, .mainframe {
          width: 100% !important;
          float: none !important;
          margin: 0 0 10px 0 !important;
        }
        
        /* Fix mainframe */
        .mainframe {
          overflow-x: hidden !important;
          overflow-y: visible !important;
          height: auto !important;
        }
        
        /* Fix sideframes */
        .sideframe {
          height: auto !important;
          min-height: auto !important;
          overflow: visible !important;
        }
        
        /* Journal entries list improvements for mobile */
        .journal-entries-list {
          width: 90% !important;
          max-width: 300px !important;
          margin: 0 auto !important;
        }
        
        /* Make journal entry links more tappable */
        .journal-entries-list a {
          padding: 10px !important;
          margin-bottom: 8px !important;
          font-size: 16px !important;
        }
        
        /* Journal entry content improvements */
        .journal-entry {
          padding: 0 10px !important;
        }
        
        .journal-entry-content {
          line-height: 1.6 !important;
        }
        
        /* Ensure navigation and content are properly sized */
        .sidecontent {
          width: 90% !important;
          margin: 10px auto !important;
        }
        
        /* Fix icon sizes in navigation */
        .quick-links img {
          height: 15px !important;
          width: auto !important;
          max-height: 15px !important;
          vertical-align: middle !important;
        }
        
        /* Hide header on mobile */
        .header02 {
          display: none !important;
        }
      }
    `;

    // Add the style element to the head
    document.head.appendChild(styleElement);

    // Apply layout fixes function
    function applyJournalLayoutFixes() {
      // Only run on journal page
      if (!window.location.pathname.includes("journal.html")) return;

      const isDesktop = window.innerWidth >= 768;
      const mainWrapper = document.querySelector(".mainwrapper > div");

      if (mainWrapper) {
        if (isDesktop) {
          // Desktop layout
          if (mainWrapper.style.display !== "flex") {
            mainWrapper.style.display = "flex";
          }
        } else {
          // Mobile layout
          if (mainWrapper.style.display !== "block") {
            mainWrapper.style.display = "block";

            // Ensure journal entries list is properly sized
            const entriesList = document.getElementById("entries-list");
            if (entriesList) {
              entriesList.style.width = "90%";
              entriesList.style.maxWidth = "300px";
              entriesList.style.margin = "0 auto";

              // Make entry links more tappable on mobile
              const entryLinks = entriesList.querySelectorAll("a");
              entryLinks.forEach(function (link) {
                link.style.padding = "10px";
                link.style.marginBottom = "8px";
                link.style.fontSize = "16px";
              });
            }

            // Fix journal entry content
            const journalContent = document.getElementById("journal-content");
            if (journalContent) {
              const journalEntries =
                journalContent.querySelectorAll(".journal-entry");
              journalEntries.forEach(function (entry) {
                entry.style.padding = "0 10px";
              });

              const entryContent = journalContent.querySelectorAll(
                ".journal-entry-content"
              );
              entryContent.forEach(function (content) {
                content.style.lineHeight = "1.6";
              });
            }
          }
        }
      }

      // Fix icon heights in navigation
      const navIcons = document.querySelectorAll(".quick-links img");
      navIcons.forEach(function (icon) {
        icon.style.height = "15px";
        icon.style.maxHeight = "15px";
        icon.style.width = "auto";
        icon.style.verticalAlign = "middle";
      });

      // Add touch support for bnuuy icon
      enableBnuuyTouchSupport();
    }

    // Add touch support for the bunny hover effect
    function enableBnuuyTouchSupport() {
      const aboutLink = document.querySelector(".about-link");
      if (!aboutLink) return;

      const defaultIcon = aboutLink.querySelector(".icon-default");
      const hoverIcon = aboutLink.querySelector(".icon-hover");

      if (defaultIcon && hoverIcon) {
        // Remove any existing touch listeners to avoid duplicates
        aboutLink.removeEventListener(
          "touchstart",
          aboutLink._touchStartHandler
        );
        aboutLink.removeEventListener("touchend", aboutLink._touchEndHandler);

        // Create handler functions
        aboutLink._touchStartHandler = function () {
          defaultIcon.style.display = "none";
          hoverIcon.style.display = "block";
        };

        aboutLink._touchEndHandler = function () {
          // Delay the reset slightly so user can see the hover state
          setTimeout(function () {
            defaultIcon.style.display = "block";
            hoverIcon.style.display = "none";
          }, 300);
        };

        // Add event listeners
        aboutLink.addEventListener("touchstart", aboutLink._touchStartHandler);
        aboutLink.addEventListener("touchend", aboutLink._touchEndHandler);
      }
    }

    // Run layout fixes after page has loaded
    window.addEventListener("load", applyJournalLayoutFixes);

    // Run layout fixes when window is resized
    window.addEventListener("resize", applyJournalLayoutFixes);

    // Also run layout fixes now with a small delay
    setTimeout(applyJournalLayoutFixes, 100);
  }
});
