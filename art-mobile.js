/**
 * art-mobile.js - Art Gallery page-specific mobile fixes
 * Add this file to your website and include it ONLY in art.html
 */

// Wait until DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Only apply fixes to art.html page
  if (window.location.pathname.includes("art.html")) {
    console.log("Art Gallery page detected - applying specific fixes");

    // Create and append art gallery specific styles
    const styleElement = document.createElement("style");
    styleElement.id = "art-gallery-responsive-fix";
    styleElement.innerHTML = `
      /* DESKTOP STYLES - Ensure flex layout is preserved */
      @media screen and (min-width: 768px) {
        /* Force horizontal layout on desktop */
        .mainwrapper > div {
          display: flex !important;
        }
        
        /* Force correct width for mainframe on desktop */
        .mainframe {
          width: 680px !important;
          flex-grow: 1 !important;
          flex-basis: 680px !important;
        }
        
        /* Force correct width for left sideframe */
        .sideframe.left-sideframe {
          width: 175px !important;
          flex-shrink: 0 !important;
          flex-basis: 175px !important;
        }
      }

      /* MOBILE STYLES - Only apply on small screens */
      @media screen and (max-width: 767px) {
        /* Stack layout vertically */
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
        
        /* Fix left sideframe */
        .sideframe.left-sideframe {
          height: auto !important;
          min-height: auto !important;
          overflow: visible !important;
        }
        
        /* Hide right sideframe */
        .sideframe:not(.left-sideframe),
        .art-gallery-right-sideframe {
          display: none !important;
        }
        
        /* Center filter box - Specific targeting for the dotted box */
        .filters {
          width: 90% !important;
          max-width: 280px !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        
        /* Add centering for the sidecontent container */
        .left-section.filter-section .sidecontent {
          text-align: center !important;
        }
        
        /* Fix thumbnail grid */
        .thumbnail-grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)) !important;
          width: 100% !important;
          gap: 8px !important;
          padding: 0 5px !important;
        }
        
        /* Fix icon sizes in navigation */
        .quick-links img {
          height: 15px !important;
          width: auto !important;
          max-height: 15px !important;
          vertical-align: middle !important;
        }
      }
    `;

    // Add the style element to the head
    document.head.appendChild(styleElement);

    // Apply layout fixes function
    function applyArtGalleryLayoutFixes() {
      // Only run on art gallery page
      if (!window.location.pathname.includes("art.html")) return;

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

            // Center filters box directly
            const filters = document.querySelector(".filters");
            if (filters) {
              filters.style.width = "90%";
              filters.style.maxWidth = "280px";
              filters.style.marginLeft = "auto";
              filters.style.marginRight = "auto";
            }

            // Center the parent container
            const filterSection = document.querySelector(
              ".left-section.filter-section .sidecontent"
            );
            if (filterSection) {
              filterSection.style.textAlign = "center";
            }
          }
        }
      }
    }

    // Run on load, resize, and delayed start
    window.addEventListener("load", applyArtGalleryLayoutFixes);
    window.addEventListener("resize", applyArtGalleryLayoutFixes);
    setTimeout(applyArtGalleryLayoutFixes, 100);
  }
});
