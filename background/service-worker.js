/**
 * Background service worker — updates badge based on active tab URL.
 */

// Cannot use ES modules in service worker with MV3 in all Chrome versions,
// so we inline the needed logic here.

const DEFAULT_RULES = [
  // --- Local / hosts file patterns ---
  {
    id: "default-localhost", name: "Local", pattern: "localhost*",
    type: "hostname", env: "local", color: "#3182ce", textColor: "#ffffff", enabled: true
  },
  {
    id: "default-127", name: "Local", pattern: "127.0.0.1*",
    type: "hostname", env: "local", color: "#3182ce", textColor: "#ffffff", enabled: true
  },
  {
    id: "default-dot-local", name: "Local", pattern: "*.local",
    type: "hostname", env: "local", color: "#3182ce", textColor: "#ffffff", enabled: true
  },
  {
    id: "default-dot-test", name: "Local", pattern: "*.test",
    type: "hostname", env: "local", color: "#3182ce", textColor: "#ffffff", enabled: true
  },
  // --- Development ---
  {
    id: "default-dev", name: "Development", pattern: "*.dev.*",
    type: "hostname", env: "development", color: "#38a169", textColor: "#ffffff", enabled: true
  },
  {
    id: "default-dev-internal", name: "Development", pattern: "*.internal",
    type: "hostname", env: "development", color: "#38a169", textColor: "#ffffff", enabled: true
  },
  // --- Staging ---
  {
    id: "default-stg", name: "Staging", pattern: "*.stg.*",
    type: "hostname", env: "staging", color: "#dd6b20", textColor: "#ffffff", enabled: true
  },
  {
    id: "default-staging", name: "Staging", pattern: "*.staging.*",
    type: "hostname", env: "staging", color: "#dd6b20", textColor: "#ffffff", enabled: true
  },
  // --- Production (disabled by default — user should customize) ---
  {
    id: "default-prod", name: "Production", pattern: "*.example.com",
    type: "hostname", env: "production", color: "#e53e3e", textColor: "#ffffff", enabled: false
  }
];

const DEFAULT_SETTINGS = {
  globalEnabled: true,
  showBanner: true,
  showBadge: true,
  bannerPosition: "top"
};

const ENV_BADGE_TEXT = {
  production: "PROD",
  staging: "STG",
  development: "DEV",
  local: "LOCAL"
};

function globToRegex(pattern) {
  const escaped = pattern
    .replace(/([.+^${}()|[\]\\])/g, "\\$1")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp("^" + escaped + "$", "i");
}

function matchUrl(url, rules) {
  if (!url || !Array.isArray(rules)) return null;
  let parsed;
  try { parsed = new URL(url); } catch { return null; }
  for (const rule of rules) {
    if (!rule.enabled) continue;
    const target = rule.type === "url" ? url : parsed.hostname;
    if (globToRegex(rule.pattern).test(target)) return rule;
  }
  return null;
}

async function getRules() {
  const { rules } = await chrome.storage.local.get({ rules: DEFAULT_RULES });
  return Array.isArray(rules) ? rules : DEFAULT_RULES;
}

async function getSettings() {
  const { settings } = await chrome.storage.local.get({ settings: DEFAULT_SETTINGS });
  return { ...DEFAULT_SETTINGS, ...settings };
}

async function updateBadge(tabId, url) {
  const settings = await getSettings();
  if (!settings.globalEnabled || !settings.showBadge) {
    await chrome.action.setBadgeText({ tabId, text: "" });
    return;
  }

  const rules = await getRules();
  const match = matchUrl(url, rules);

  if (match) {
    const text = ENV_BADGE_TEXT[match.env] || match.env?.slice(0, 4).toUpperCase() || "?";
    await chrome.action.setBadgeText({ tabId, text });
    await chrome.action.setBadgeBackgroundColor({ tabId, color: match.color });
    await chrome.action.setBadgeTextColor({ tabId, color: match.textColor || "#ffffff" });
  } else {
    await chrome.action.setBadgeText({ tabId, text: "" });
  }
}

// Update badge when tab is activated or updated
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url) await updateBadge(tabId, tab.url);
  } catch { /* tab may not exist */ }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    if (tab.url) await updateBadge(tabId, tab.url);
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_MATCH") {
    (async () => {
      const settings = await getSettings();
      if (!settings.globalEnabled) {
        sendResponse({ match: null, settings });
        return;
      }
      const rules = await getRules();
      const match = matchUrl(message.url, rules);
      sendResponse({ match, settings });
    })();
    return true; // async response
  }

  if (message.type === "SETTINGS_UPDATED") {
    // Re-evaluate all tabs
    chrome.tabs.query({}, async (tabs) => {
      for (const tab of tabs) {
        if (tab.url && tab.id) await updateBadge(tab.id, tab.url);
      }
    });
    sendResponse({ ok: true });
    return true;
  }
});
