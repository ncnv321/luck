// sanity-gallery.js
document.addEventListener('DOMContentLoaded', function() {
  loadGalleryContent();
  
  // Check if we have Swup initialized
  if (window.swup) {
    // Set up hooks for Swup events
    window.swup.hooks.on('page:view', function() {
      // Only reload gallery if we're on the art page
      if (window.location.pathname.includes('/art.html')) {
        setTimeout(loadGalleryContent, 100);
      }
    });
  }
});

function loadGalleryContent() {
  // Only proceed if we're on the art gallery page
  if (!window.location.pathname.includes('/art.html')) {
    return;
  }
  
  // Initialize the Sanity client
  const client = sanityClient({
    projectId: 'asrslodd', // Replace with your project ID
    dataset: 'production',
    apiVersion: '2025-05-03', // Use today's date
    useCdn: true
  });

  // Get the container where artworks will be displayed
  const artworksContainer = document.querySelector('.artworks');
  if (!artworksContainer) return;
  
  // Show loading indicator
  artworksContainer.innerHTML = '<div class="loading-indicator" style="text-align: center; padding: 20px;">Loading gallery...</div>';

  // Query to fetch all artworks organized by category/year
  const query = `*[_type == "artwork"] {
    _id,
    title,
    "imageUrl": image.asset->url,
    year,
    description,
    category
  } | order(year desc)`;

  // Execute the query
  client.fetch(query)
    .then(artworks => {
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
      
      // Categories to display in order (ensures they appear in your preferred order)
      const orderedCategories = ['2025', '2024', '2023', '2022', 'sketches'];
      
      // Create sections for each category
      orderedCategories.forEach(category => {
        if (!categories[category] || categories[category].length === 0) {
          return; // Skip empty categories
        }
        
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
          link.dataset.description = artwork.description;
          
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
      
      // Initialize lightbox if available
      if (typeof SimpleLightbox !== 'undefined') {
        initLightbox();
      }
    })
    .catch(error => {
      console.error('Error fetching artworks:', error);
      artworksContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Error loading gallery. Please try again later.</div>';
    });
}

function initLightbox() {
  new SimpleLightbox('.thumbnail a', {
    captionsData: 'description',
    captionDelay: 250
  });
}