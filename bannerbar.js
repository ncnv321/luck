// bannerbar.js (Updated Logic for Shrink/Grow)

const initBannerProgressBar = () => {
    const bannerProgressBar = document.querySelector('.banner');
    const swupInstance = window.swup; // Access the global swup instance

    if (!bannerProgressBar) {
        console.error("Banner progress bar element not found.");
        return;
    }
    if (!swupInstance) {
        console.error("Swup instance not found. Ensure bannerbar.js runs after Swup initialization.");
        // Attempt to wait for swup instance if it's not ready yet
        document.addEventListener('swup:enable', initBannerProgressBar, { once: true });
        return;
    }

    // --- Swup Event Hooks ---

    swupInstance.hooks.on('transition:start', (visit) => {
        // 1. Immediately shrink the banner to a small width
        bannerProgressBar.style.transitionDuration = '0.1s'; // Shrink fast
        bannerProgressBar.style.transform = 'scaleX(0.01)'; // Shrink to 1% (adjust as needed for 5-10px)
        bannerProgressBar.style.opacity = '1'; // Ensure visible
        bannerProgressBar.classList.add('is-loading'); // Add loading class

         // 2. Force reflow before setting the loading animation target
         // Use a tiny timeout to allow the initial shrink to apply
        setTimeout(() => {
           // Re-apply the transition duration for the loading animation
           bannerProgressBar.style.transitionDuration = '1.2s'; // Match CSS
           // The CSS rule for .is-loading will now animate towards scaleX(1)
        }, 50); // Short delay
    });

    swupInstance.hooks.on('transition:end', (visit) => {
        // Ensure banner is fully visible and scaled at the end
        bannerProgressBar.classList.remove('is-loading');
         // Reset transition duration to default after animation
        bannerProgressBar.style.transitionDuration = '0.3s'; // Match default transition
        bannerProgressBar.style.transform = 'scaleX(1)';
        bannerProgressBar.style.opacity = '1';
    });

     swupInstance.hooks.on('transition:abort', (visit) => {
        // Reset banner if transition is cancelled
        bannerProgressBar.classList.remove('is-loading');
        bannerProgressBar.style.transitionDuration = '0.3s'; // Match default transition
        bannerProgressBar.style.transform = 'scaleX(1)'; // Back to full width
        bannerProgressBar.style.opacity = '1';
     });

};

// --- Initialization ---
// Check if Swup is already initialized
if (window.swup) {
    initBannerProgressBar();
} else {
    // Otherwise, wait for Swup to be ready
    document.addEventListener('swup:enable', initBannerProgressBar, { once: true });
}

// --- Script Re-initialization Logic ---

function initializeBnuuyHover() {
    const aboutLink = document.querySelector(".about-link");
    const defaultIcon = aboutLink ? aboutLink.querySelector(".icon-default") : null;
    const hoverIcon = aboutLink ? aboutLink.querySelector(".icon-hover") : null;

    // Remove previous listeners if they exist to prevent duplicates (important!)
    // This requires storing the handler functions if they are anonymous
    // For simplicity here, we assume the original script block isn't re-run automatically

    if (aboutLink && defaultIcon && hoverIcon) {
        const handleMouseEnter = () => {
            defaultIcon.style.display = "none";
            hoverIcon.style.display = "block";
        };
        const handleMouseLeave = () => {
            defaultIcon.style.display = "block";
            hoverIcon.style.display = "none";
        };

        // Store handlers to remove them later if needed, or ensure this only runs once per element
        // A simple check if a listener was already added might be needed for robustness

        aboutLink.removeEventListener('mouseenter', handleMouseEnter); // Attempt to remove old one
        aboutLink.removeEventListener('mouseleave', handleMouseLeave); // Attempt to remove old one
        aboutLink.addEventListener("mouseenter", handleMouseEnter);
        aboutLink.addEventListener("mouseleave", handleMouseLeave);

        // Ensure initial state is correct
         defaultIcon.style.display = "block";
         hoverIcon.style.display = "none";
    }
}

// Function to re-load external scripts. Simple but might cause issues if
// the scripts aren't designed to be run multiple times.
function loadScript(src, id) {
    // Remove existing script tag if it exists by id
    const oldScript = document.getElementById(id);
    if (oldScript) {
        oldScript.remove();
    }
    // Add new script tag
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.id = id; // Add an ID to manage it
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

async function initializePageScripts() {
    // Re-run bnuuy hover initialization if the element exists
    if (document.querySelector('.about-link')) {
        initializeBnuuyHover();
    }

    // Re-run visitor/time scripts if elements exist
    if (document.querySelector('#hitcount') || document.querySelector('#time')) {
         try {
             // Remove potentially old script tags first before re-adding
             document.getElementById('lloadinfo-script')?.remove();
             document.getElementById('time-script')?.remove();

             // Load scripts sequentially
             await loadScript('/lloadinfo.js', 'lloadinfo-script');
             await loadScript('/time.js', 'time-script');
         } catch (error) {
             console.error("Error loading page scripts:", error);
         }
    }

    // Add logic here to re-apply specific styles or classes if needed
    // e.g., for the dotted line if it's dynamically added:
    // document.querySelector('.left-section.left-top-section')?.classList.add('has-dotted-border');

    // Ensure scrollbars are recalculated if needed (usually CSS handles this)
    document.querySelector('.mainframe')?.style.overflowY = 'scroll'; // Re-apply just in case
    document.querySelector('.sideframe')?.style.overflowY = 'auto';
}

// --- Swup Hook for Re-initialization ---
 if (window.swup) {
     window.swup.hooks.on('page:view', (visit) => {
         console.log("Page view loaded, re-initializing scripts..."); // Debugging
         initializePageScripts();
     });
 } else {
     console.error("Swup not initialized when trying to attach page:view hook.");
 }

// --- End Script Re-initialization ---