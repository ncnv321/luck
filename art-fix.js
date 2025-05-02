// Create this as art-fix.js and add it to ALL your pages

(function() {
  // Store current URL for comparison
  let lastUrl = location.href;
  
  // Track if we're already in the process of handling this page
  let handlingArtPage = false;
  
  // When Art Gallery page is loaded
  function handleArtGalleryPage() {
    if (handlingArtPage) return; // Prevent duplicate execution
    handlingArtPage = true;
    
    console.log("Art Gallery page detected - initializing properly");
    
    // Force reload the Sanity client script
    loadSanityClient();
    
    // Force reload the gallery script with a different approach
    setTimeout(() => {
      const existingScript = document.getElementById('gallery-script');
      if (existingScript) existingScript.remove();
      
      const script = document.createElement('script');
      script.id = 'gallery-script';
      script.innerHTML = `
        // Wait for Sanity client to be available
        function waitForSanity(callback, attempts = 0) {
          if (window.createClient) {
            callback();
          } else if (attempts < 50) { // Try for about 5 seconds
            setTimeout(() => waitForSanity(callback, attempts + 1), 100);
          } else {
            console.error("Sanity client failed to load");
            const container = document.querySelector(".artworks");
            if (container) {
              container.innerHTML = '<div style="text-align: center; padding: 20px;">Error loading artwork. Please refresh the page.</div>';
            }
          }
        }
        
        // Initialize gallery once Sanity is ready
        waitForSanity(() => {
          console.log("Sanity client ready, loading gallery content");
          
          const client = window.createClient({
            projectId: "asrslodd",
            dataset: "production",
            apiVersion: "2025-05-03",
            useCdn: true
          });
          
          const query = '*[_type == "artwork"] { _id, title, "imageUrl": image.asset->url, year, description, category } | order(year desc)';
          
          const artworksContainer = document.querySelector(".artworks");
          
          // Execute query
          client.fetch(query)
            .then(artworks => {
              console.log("Fetched " + artworks.length + " artworks");
              
              // Group by category
              const categories = {};
              artworks.forEach(artwork => {
                if (!categories[artwork.category]) {
                  categories[artwork.category] = [];
                }
                categories[artwork.category].push(artwork);
              });
              
              // Clear container
              artworksContainer.innerHTML = "";
              
              // Ordered categories
              const orderedCategories = ["2025", "2024", "2023", "2022", "sketches"];
              
              // Create sections
              orderedCategories.forEach(category => {
                if (!categories[category] || categories[category].length === 0) return;
                
                // Year section
                const yearSection = document.createElement("div");
                yearSection.className = "year-section";
                yearSection.id = "year-" + category;
                
                // Header
                const header = document.createElement("h2");
                header.style.textAlign = "center";
                header.style.borderBottom = "1px dashed white";
                header.style.paddingBottom = "5px";
                header.style.margin = "20px 0 15px 0";
                header.textContent = category === "sketches" ? "Sketches & Scraps" : category;
                yearSection.appendChild(header);
                
                // Grid
                const thumbnailGrid = document.createElement("div");
                thumbnailGrid.className = "thumbnail-grid";
                thumbnailGrid.style.display = "grid";
                thumbnailGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(90px, 1fr))";
                thumbnailGrid.style.gap = "15px";
                thumbnailGrid.style.marginBottom = "25px";
                
                // Add artworks
                categories[category].forEach(artwork => {
                  const thumbnail = document.createElement("div");
                  thumbnail.className = "thumbnail";
                  
                  const link = document.createElement("a");
                  link.href = artwork.imageUrl;
                  link.dataset.description = artwork.description || "";
                  
                  const image = document.createElement("img");
                  image.src = artwork.imageUrl + "?w=90&h=90&fit=crop";
                  image.alt = artwork.title;
                  image.title = artwork.title;
                  image.loading = "lazy";
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
              if (typeof SimpleLightbox !== "undefined") {
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
                  showCounter: false
                });
              }
            })
            .catch(error => {
              console.error("Error fetching artworks:", error);
              artworksContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Error loading gallery. Please try again later.</div>';
            });
        });
      `;
      document.body.appendChild(script);
    }, 200);
    
    // Release the lock after a delay
    setTimeout(() => {
      handlingArtPage = false;
    }, 1000);
  }
  
  // Load Sanity client
  function loadSanityClient() {
    // Check if Sanity client is already loaded
    if (window.createClient) {
      console.log("Sanity client already loaded");
      return;
    }
    
    // Create the global object needed
    window.global = window;
    
    // Create script tag for ESM module
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import { createClient } from "https://esm.sh/@sanity/client";
      window.createClient = createClient;
      console.log("Sanity client imported successfully");
    `;
    document.head.appendChild(script);
  }
  
  // Setup observer to monitor URL changes (works with Swup)
  const observer = new MutationObserver(() => {
    if (lastUrl !== location.href) {
      lastUrl = location.href;
      console.log("URL changed to:", location.href);
      
      // If we're on the art gallery page, handle it
      if (location.href.includes('/art.html')) {
        handleArtGalleryPage();
      }
    }
  });
  
  // Start observing
  observer.observe(document, {subtree: true, childList: true});
  
  // Also check immediately (for direct page loads)
  if (location.href.includes('/art.html')) {
    // Delay to ensure DOM is ready
    setTimeout(handleArtGalleryPage, 100);
  }
  
  // Add hook for Swup if it's available/loaded
  document.addEventListener('swup:contentReplaced', function() {
    console.log("Swup content replaced event detected");
    
    // If we're on the art gallery page, handle it
    if (location.href.includes('/art.html')) {
      // Delay to ensure DOM is ready after Swup replaces content
      setTimeout(handleArtGalleryPage, 200);
    }
  });
})();