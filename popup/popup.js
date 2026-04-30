/**
 * Popup script — shows current environment status and global toggle.
 */

const DEFAULT_SETTINGS = {
  globalEnabled: true,
  showBanner: true,
  showBadge: true,
  bannerPosition: "top"
};

const globalToggle = document.getElementById("globalToggle");
const statusArea = document.getElementById("statusArea");
const openOptions = document.getElementById("openOptions");

async function getSettings() {
  const { settings } = await chrome.storage.local.get({ settings: DEFAULT_SETTINGS });
  return { ...DEFAULT_SETTINGS, ...settings };
}

async function saveSettings(settings) {
  await chrome.storage.local.set({ settings });
}

async function init() {
  const settings = await getSettings();
  globalToggle.checked = settings.globalEnabled;

  // Get active tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    statusArea.innerHTML = '<div class="no-match">No page detected</div>';
    return;
  }

  if (!settings.globalEnabled) {
    statusArea.innerHTML = '<div class="no-match">Disabled</div>';
    statusArea.classList.add("disabled-overlay");
    return;
  }

  // Ask background for match
  chrome.runtime.sendMessage({ type: "GET_MATCH", url: tab.url }, (response) => {
    if (chrome.runtime.lastError || !response) {
      statusArea.innerHTML = '<div class="no-match">Error</div>';
      return;
    }

    const { match } = response;
    if (match) {
      statusArea.innerHTML = `
        <div class="env-badge" style="background:${match.color};color:${match.textColor || '#fff'}">
          ${match.name || match.env}
        </div>
        <div class="status-label">${match.pattern}</div>
      `;
    } else {
      statusArea.innerHTML = '<div class="no-match">No matching rule</div>';
    }
  });
}

globalToggle.addEventListener("change", async () => {
  const settings = await getSettings();
  settings.globalEnabled = globalToggle.checked;
  await saveSettings(settings);
  chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED" });

  // Refresh banner in active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: "REFRESH_BANNER" }).catch(() => {});
  }

  init();
});

openOptions.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

init();
