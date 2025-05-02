/**
 * aboutme-mobile.js - About Me page-specific mobile fixes
 * Add this file to your website and include it ONLY in aboutme.html
 */

// Wait until DOM is ready
document.addEventListener("DOMContentLoaded", function() {
  // Only apply fixes to aboutme.html page
  if (window.location.pathname.includes("aboutme.html")) {
    console.log("About Me page detected - applying specific fixes");
    
    // Create and append about me specific styles
    const styleElement = document.createElement("style");
    styleElement.id = "aboutme-responsive-fix";
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
          min-height: auto !important;
        }
        
        /* Fix sideframes */
        .sideframe {
          height: auto !important;
          min-height: auto !important;
          overflow: visible !important;
        }
        
        /* Fix left sections */
        .left-section {
          height: auto !important;
          min-height: 0 !important;
        }
        
        /* Fix kins marquee to display horizontally */
        .changelog {
          width: 90% !important;
          max-width: 300px !important;
          margin: 0 auto 10px auto !important;
          height: 80px !important;
          overflow: hidden !important;
        }
        
        .changelog marquee {
          white-space: nowrap !important;
        }
        
        .changelog img {
          display: inline-block !important;
          vertical-align: middle !important;
          margin: 0 5px !important;
        }
        
        /* Make likes/dislikes box match width */
        .likes-dislikes {
          width: 90% !important;
          max-width: 300px !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        
        /* Fix icon sizes in quick links */
        .quick-links img {
          height: 15px !important;
          width: auto !important;
          max-height: 15px !important;
          vertical-align: middle !important;
        }
        
        /* Fix line spacing */
        .quick-links p {
          line-height: 1.8 !important;
          margin: 0 !important;
          text-align: left !important;
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
    function applyAboutMeLayoutFixes() {
      // Only run on about me page
      if (!window.location.pathname.includes("aboutme.html")) return;
      
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
            
            // Fix kins marquee
            const changelog = document.querySelector('.changelog');
            if (changelog) {
              changelog.style.width = '90%';
              changelog.style.maxWidth = '300px';
              changelog.style.margin = '0 auto 10px auto';
              changelog.style.height = '80px';
            }
            
            // Fix likes box
            const likesBox = document.querySelector('.likes-dislikes');
            if (likesBox) {
              likesBox.style.width = '90%';
              likesBox.style.maxWidth = '300px';
              likesBox.style.marginLeft = 'auto';
              likesBox.style.marginRight = 'auto';
            }
          }
        }
      }
    }
    
    // Run layout fixes after page has loaded
    window.addEventListener('load', applyAboutMeLayoutFixes);
    
    // Run layout fixes when window is resized
    window.addEventListener('resize', applyAboutMeLayoutFixes);
    
    // Also run layout fixes now
    setTimeout(applyAboutMeLayoutFixes, 100);
  }
});