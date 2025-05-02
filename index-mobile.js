/**
 * index-mobile.js - Homepage-specific mobile fixes
 * Add this file to your website and include it ONLY in index.html
 */

// Wait until DOM is ready
document.addEventListener("DOMContentLoaded", function() {
  // Only apply fixes to index.html page
  if (window.location.pathname === "/" || 
      window.location.pathname === "/index.html" || 
      window.location.pathname.endsWith("index.html")) {
    
    console.log("Homepage detected - applying specific fixes");
    
    // Create and append homepage specific styles
    const styleElement = document.createElement("style");
    styleElement.id = "index-responsive-fix";
    styleElement.innerHTML = `
      /* DESKTOP STYLES - Ensure flex layout is preserved */
      @media screen and (min-width: 768px) {
        /* Force horizontal layout on desktop */
        .mainwrapper > div {
          display: flex !important;
        }
        
        /* Correct widths for all frames */
        .sideframe {
          width: 175px !important;
          flex-shrink: 0 !important;
          flex-basis: 175px !important;
        }
        
        .mainframe {
          width: 510px !important;
          flex-grow: 1 !important;
          flex-basis: 510px !important;
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
        
        /* Fix changelog scrolling */
        .changelog {
          width: 90% !important;
          max-width: 300px !important;
          margin: 0 auto 10px auto !important;
          overflow-y: auto !important;
          height: 200px !important;
        }
        
        /* Ensure navigation and content are properly sized */
        .sidecontent {
          width: 90% !important;
          margin: 10px auto !important;
        }
        
        /* Fix icon sizes in navigation */
        .sidecontent img {
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
    function applyIndexLayoutFixes() {
      // Only run on index page
      if (!(window.location.pathname === "/" || 
            window.location.pathname === "/index.html" || 
            window.location.pathname.endsWith("index.html"))) {
        return;
      }
      
      const isDesktop = window.innerWidth >= 768;
      const mainWrapper = document.querySelector('.mainwrapper > div');
      
      if (mainWrapper) {
        if (isDesktop) {
          // Desktop layout
          if (mainWrapper.style.display !== 'flex') {
            mainWrapper.style.display = 'flex';
          }
        } else {
          // Mobile layout
          if (mainWrapper.style.display !== 'block') {
            mainWrapper.style.display = 'block';
            
            // Ensure changelog is scrollable
            const changelog = document.querySelector('.changelog');
            if (changelog) {
              changelog.style.overflowY = 'auto';
              changelog.style.height = '200px';
            }
          }
        }
      }
    }
    
    // Run layout fixes after page has loaded
    window.addEventListener('load', applyIndexLayoutFixes);
    
    // Run layout fixes when window is resized
    window.addEventListener('resize', applyIndexLayoutFixes);
    
    // Also run layout fixes now
    setTimeout(applyIndexLayoutFixes, 100);
  }
});