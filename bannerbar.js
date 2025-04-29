// bannerbar.js (Updated Logic)

// Ensure swup instance is available (assuming it's declared globally or accessible)
// If swup is initialized *after* this script runs, this will fail.
// Make sure this script is loaded AFTER the Swup initialization script block in HTML.

const initBannerProgressBar = () => {
  const bannerProgressBar = document.querySelector('.banner');
  const swupInstance = window.swup; // Access the global swup instance

  if (!bannerProgressBar) {
    console.error("Banner progress bar element not found.");
    return;
  }
  if (!swupInstance) {
    console.error("Swup instance not found. Ensure bannerbar.js runs after Swup initialization.");
    return;
  }

  // --- Swup Event Hooks ---

  // Hook: Transition Starts
  swupInstance.hooks.on('transition:start', (visit) => {
    // 1. Quick fade out
    bannerProgressBar.classList.add('is-fading-out');

    // 2. After fade out, reset and start loading animation
    setTimeout(() => {
      bannerProgressBar.style.transform = 'scaleX(0)'; // Reset width
      bannerProgressBar.classList.remove('is-fading-out'); // Remove fade-out class
      // Force browser reflow before adding loading class
      void bannerProgressBar.offsetWidth;
      bannerProgressBar.classList.add('is-loading'); // Add loading class (triggers CSS width animation)
    }, 200); // Delay matches fade-out transition (0.2s)
  });

  // Hook: Content Replaced (Transition halfway)
  swupInstance.hooks.on('content:replace', (visit) => {
    // The CSS animation handles the bar filling up based on 'is-loading' class
    // You could potentially force it to 100% here if needed,
    // but letting the CSS transition run usually looks okay.
    // bannerProgressBar.style.transform = 'scaleX(1)'; // Optional: force full width earlier
  });

  // Hook: Transition Ends
  swupInstance.hooks.on('transition:end', (visit) => {
     // Ensure banner is fully visible and scaled
     bannerProgressBar.classList.remove('is-loading');
     bannerProgressBar.style.transform = 'scaleX(1)';
     bannerProgressBar.style.opacity = '1'; // Explicitly ensure visible

     // Optional: Slightly delay resetting pointer-events if needed
     // setTimeout(() => {
     //   bannerProgressBar.style.pointerEvents = 'auto';
     // }, 100);
  });

  // Hook: Transition Aborted (e.g., user clicks another link quickly)
   swupInstance.hooks.on('transition:abort', (visit) => {
     // Reset banner immediately if transition is cancelled
     bannerProgressBar.classList.remove('is-loading', 'is-fading-out');
     bannerProgressBar.style.transform = 'scaleX(1)'; // Back to full width
     bannerProgressBar.style.opacity = '1';
   });

};

// --- Initialization ---
// Run the setup logic *after* the main page content is loaded
// and *after* Swup is initialized.
// We might need to ensure Swup is ready. A simple timeout works,
// but listening for a custom event or checking window.swup might be more robust.

if (window.swup) {
  initBannerProgressBar();
} else {
  document.addEventListener('swup:enable', initBannerProgressBar); // Listen for Swup's ready event if available
  // Fallback if swup:enable isn't used/fired
   window.addEventListener('load', () => {
       setTimeout(initBannerProgressBar, 0); // Run after current execution context
   });
}