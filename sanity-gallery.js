// sanity-gallery.js
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, starting gallery initialization");
  loadGalleryContent();
  
  // Check if we have Swup initialized
  if (window.swup) {
    console.log("Swup detected, setting up hooks");
    // Set up hooks for Swup events
    window.swup.hooks.on('page:view', function() {
      // Only reload gallery if we're on the art page
      if (window.location.pathname.includes('/art.html')) {
        console.log("Page view event detected for art gallery");
        setTimeout(loadGalleryContent, 100);
      }
    });
  }
});

function loadGalleryContent() {
  console.log("loadGalleryContent called");
  
  // Only proceed if we're on the art gallery page
  if (!window.location.pathname.includes('/art.html')) {
    console.log("Not on art.html page, exiting");
    return;
  }
  
  // Get the container where artworks will be displayed
  const artworksContainer = document.querySelector('.artworks');
  if (!artworksContainer) {
    console.error("Artworks container not found");
    return;
  }
  
  // Show loading indicator
  artworksContainer.innerHTML = '<div class="loading-indicator" style="text-align: center; padding: 20px;">Loading gallery...</div>';
  
  try {
    console.log("Initializing Sanity client");
    
    // Check if createClient is available
    if (typeof window.createClient === 'function') {
      console.log("Using window.createClient");
      var client = window.createClient({
        projectId: 'asrslodd',
        dataset: 'production',
        apiVersion: '2025-05-03',
        useCdn: true
      });
    } else {
      console.error("Sanity client not found. Make sure the library is loaded properly.");
      console.log("Available global objects:", {
        createClient: typeof window.createClient,
        SanityClient: typeof window.SanityClient,
        sanityClient: typeof window.sanityClient
      });
      artworksContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Error: Sanity client not available. Please check the console for details.</div>';
      return;
    }
    
    console.log("Sanity client initialized successfully");
    
    // Query to fetch all artworks organized by category/year
    const query = `*[_type == "artwork"] {
      _id,
      title,
      "imageUrl": image.asset->url,
      year,
      description,
      category
    } | order(year desc)`;
    
    console.log("Executing query:", query);

    // Execute the query
    client.fetch(query)
      .then(artworks => {
        console.log("Query successful, received artworks:", artworks);
        
        // If no artworks, show a message
        if (!artworks || artworks.length === 0) {
          artworksContainer.innerHTML = '<div style="text-align: center; padding: 20px;">No artworks found. Add some in your Sanity Studio!</div>';
          return;
        }
        
        // Group artworks by category
        const categories = {};
        artworks.forEach(artwork => {
          if (!categories[artwork.category]) {
            categories[artwork.category] = [];
          }
          categories[artwork.category].push(artwork);
        });

        // Clear the container
        artworksContainer.innerHTML = '';
        
        // Categories to display in order
        const orderedCategories = ['2025', '2024', '2023', '2022', 'sketches'];
        
        // Create sections for each category
        orderedCategories.forEach(category => {
          if (!categories[category] || categories[category].length === 0) {
            return; // Skip empty categories
          }
          
          console.log(`Creating section for category: ${category}`);
          
          // Create year section
          const yearSection = document.createElement('div');
          yearSection.className = 'year-section';
          yearSection.id = `year-${category}`;
          
          // Add header
          const header = document.createElement('h2');
          header.style.textAlign = 'center';
          header.style.borderBottom = '1px dashed white';
          header.style.paddingBottom = '5px';
          header.style.margin = '20px 0 15px 0';
          header.textContent = category === 'sketches' ? 'Sketches & Scraps' : category;
          yearSection.appendChild(header);
          
          // Create thumbnail grid
          const thumbnailGrid = document.createElement('div');
          thumbnailGrid.className = 'thumbnail-grid';
          
          // Add each artwork to the grid
          categories[category].forEach(artwork => {
            const thumbnail = document.createElement('div');
            thumbnail.className = 'thumbnail';
            
            const link = document.createElement('a');
            link.href = artwork.imageUrl;
            link.dataset.description = artwork.description || '';
            
            const image = document.createElement('img');
            image.src = `${artwork.imageUrl}?w=200&h=200&fit=crop`;
            image.alt = artwork.title;
            image.title = artwork.title;
            image.setAttribute('loading', 'lazy');
            
            link.appendChild(image);
            thumbnail.appendChild(link);
            thumbnailGrid.appendChild(thumbnail);
          });
          
          yearSection.appendChild(thumbnailGrid);
          artworksContainer.appendChild(yearSection);
        });
        
        console.log("Gallery rendering complete");
        
        // Initialize lightbox if available
        if (typeof SimpleLightbox !== 'undefined') {
          console.log("Initializing lightbox");
          initLightbox();
        }
      })
      .catch(error => {
        console.error('Error fetching artworks:', error);
        artworksContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Error loading gallery. Please check the console for details.</div>';
      });
  } catch (error) {
    console.error('Exception in gallery script:', error);
    artworksContainer.innerHTML = '<div style="text-align: center; padding: 20px;">An error occurred while setting up the gallery. Please check the console for details.</div>';
  }
}

function initLightbox() {
  new SimpleLightbox('.thumbnail a', {
    captionsData: 'description',
    captionDelay: 250
  });
}