/**
 * Content script — injects environment banner into the page.
 */

(function () {
  const BANNER_ID = "env-marker-banner";

  function removeBanner() {
    const existing = document.getElementById(BANNER_ID);
    if (existing) existing.remove();
  }

  function createBanner(match, settings) {
    removeBanner();

    if (!settings.showBanner) return;

    const banner = document.createElement("div");
    banner.id = BANNER_ID;
    banner.setAttribute("data-position", settings.bannerPosition || "top");
    banner.style.backgroundColor = match.color;
    banner.style.color = match.textColor || "#ffffff";
    banner.textContent = match.name || match.env || "Unknown";

    (document.documentElement || document.body).appendChild(banner);
  }

  function init() {
    chrome.runtime.sendMessage(
      { type: "GET_MATCH", url: location.href },
      (response) => {
        if (chrome.runtime.lastError) return;
        if (!response) return;

        const { match, settings } = response;
        if (match && settings && settings.globalEnabled) {
          createBanner(match, settings);
        } else {
          removeBanner();
        }
      }
    );
  }

  // Run on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Listen for settings changes
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "REFRESH_BANNER") {
      init();
    }
  });
})();
