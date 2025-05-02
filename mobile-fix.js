
(function() {
  // Function to force mobile styles
  function enforceMobileStyles() {
    // Only apply on mobile devices
    if (window.innerWidth <= 767) {
      console.log("Enforcing mobile styles");
      
      // Detect current page
      const path = window.location.pathname;
      const isIndex = path === "/" || path.includes("index.html");
      const isAboutMe = path.includes("aboutme.html");
      const isArtGallery = path.includes("art.html");
      
      // Set page identifier
      document.documentElement.setAttribute("data-page", 
        isIndex ? "index" : isAboutMe ? "aboutme" : isArtGallery ? "art" : "");
      
      // ===== GLOBAL FIXES =====
      
      // Fix all frames
      document.querySelectorAll(".sideframe, .mainframe").forEach(frame => {
        frame.style.width = "100%";
        frame.style.maxWidth = "100%";
        frame.style.margin = "0 0 10px 0";
      });
      
      // Hide header
      const header = document.querySelector(".header02");
      if (header) header.style.display = "none";
      
      // Stack layout vertically
      const wrapper = document.querySelector(".mainwrapper > div");
      if (wrapper) {
        wrapper.style.display = "block";
        wrapper.style.width = "100%";
      }
      
      // ===== PAGE-SPECIFIC FIXES =====
      
      // Index page fixes
      if (isIndex) {
        // Auto-height sidebar
        document.querySelectorAll(".sideframe").forEach(frame => {
          frame.style.height = "auto";
          frame.style.minHeight = "0";
        });
        
        // Fix changelog scrolling
        const changelog = document.querySelector(".changelog");
        if (changelog) {
          changelog.style.overflowY = "auto";
          changelog.style.webkitOverflowScrolling = "touch";
          changelog.style.height = "200px";
          changelog.style.width = "90%";
          changelog.style.maxWidth = "300px";
          changelog.style.margin = "0 auto 10px auto";
        }
      }
      
      // About Me page fixes
      if (isAboutMe) {
        // Fix kins marquee
        const marquee = document.querySelector(".changelog marquee");
        if (marquee) {
          marquee.style.whiteSpace = "nowrap";
        }
        
        // Fix kins and likes boxes
        document.querySelectorAll(".changelog, .likes-dislikes").forEach(box => {
          box.style.width = "90%";
          box.style.maxWidth = "300px";
          box.style.marginLeft = "auto";
          box.style.marginRight = "auto";
        });
      }
      
      // Art Gallery fixes
      if (isArtGallery) {
        // Fix left sideframe
        const leftSideframe = document.querySelector(".left-sideframe");
        if (leftSideframe) {
          leftSideframe.style.height = "auto";
          leftSideframe.style.minHeight = "0";
          leftSideframe.style.overflow = "visible";
        }
        
        // Hide right sideframe
        const rightSideframe = document.querySelector(".art-gallery-right-sideframe");
        if (rightSideframe) {
          rightSideframe.style.display = "none";
        }
        
        // Fix mainframe
        const mainframe = document.querySelector(".mainframe");
        if (mainframe) {
          mainframe.style.overflowY = "visible";
          mainframe.style.height = "auto";
          mainframe.style.width = "100%";
          mainframe.style.maxWidth = "100%";
          mainframe.style.overflowX = "hidden";
        }
        
        // Fix gallery content
        document.querySelectorAll(".gallery-content, .artworks, .year-section").forEach(el => {
          el.style.width = "100%";
          el.style.maxWidth = "100%";
          el.style.overflowX = "hidden";
          el.style.boxSizing = "border-box";
        });
        
        // Fix thumbnail grid
        document.querySelectorAll(".thumbnail-grid").forEach(grid => {
          grid.style.display = "grid";
          grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(60px, 1fr))";
          grid.style.width = "100%";
          grid.style.maxWidth = "100%";
          grid.style.gap = "5px";
          grid.style.padding = "0 5px";
          grid.style.boxSizing = "border-box";
        });
        
        // Center filter box
        const filters = document.querySelector(".filters");
        if (filters) {
          filters.style.margin = "10px auto";
          filters.style.width = "90%";
          filters.style.maxWidth = "300px";
        }
      }
    }
  }
  
  // Run on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enforceMobileStyles);
  } else {
    enforceMobileStyles();
  }
  
  // Run when window resizes
  window.addEventListener("resize", enforceMobileStyles);
  
  // Run after any potential JS has modified the page
  window.addEventListener("load", function() {
    // Run immediately
    enforceMobileStyles();
    
    // And again after a brief delay to catch any late JS changes
    setTimeout(enforceMobileStyles, 500);
  });
  
  // Monitor for any DOM changes that might affect layout
  if (window.MutationObserver) {
    const observer = new MutationObserver(function(mutations) {
      // Check if any mutations affect styles or structure
      let needsUpdate = false;
      
      for (let mutation of mutations) {
        if (mutation.type === "attributes" && 
            (mutation.attributeName === "style" || 
             mutation.attributeName === "class")) {
          needsUpdate = true;
          break;
        }
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          needsUpdate = true;
          break;
        }
      }
      
      if (needsUpdate && window.innerWidth <= 767) {
        enforceMobileStyles();
      }
    });
    
    // Observe the entire document for changes
    observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["style", "class"]
    });
  }
})();