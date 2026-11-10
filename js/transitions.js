(() => {
  const FADE_MS = 400;
  const overlay = document.createElement("div");
  overlay.id = "fade-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "9999",
    background: "#000",
    opacity: "1",
    pointerEvents: "none",
    transition: `opacity ${FADE_MS}ms ease-in-out`,
  });

  const fadeIn = () => {
    overlay.style.opacity = "1";
    setTimeout(() => {
      overlay.style.opacity = "0";
    }, 100);
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(overlay);
    fadeIn();
  });

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) fadeIn();
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (
      !link ||
      event.defaultPrevented ||
      link.target ||
      link.hasAttribute("data-no-transition") ||
      !link.href.startsWith(window.location.origin) ||
      link.href.includes("#") ||
      link.href === window.location.href
    ) {
      return;
    }
    event.preventDefault();
    overlay.style.opacity = "1";
    setTimeout(() => {
      window.location.href = link.href;
    }, FADE_MS);
  });
})();
