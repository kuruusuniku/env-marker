/**
 * Storage I/O layer — wraps chrome.storage.local with validation.
 */

const DEFAULT_RULES = [
  { id: "default-local", name: "Local", pattern: "*local*", type: "hostname", env: "local", color: "#3182ce", textColor: "#ffffff", enabled: true },
  { id: "default-127", name: "Local", pattern: "127.0.0.1*", type: "hostname", env: "local", color: "#3182ce", textColor: "#ffffff", enabled: true },
  { id: "default-dev", name: "Development", pattern: "*dev*", type: "hostname", env: "development", color: "#38a169", textColor: "#ffffff", enabled: true },
  { id: "default-stg", name: "Staging", pattern: "*stg*", type: "hostname", env: "staging", color: "#dd6b20", textColor: "#ffffff", enabled: true },
  { id: "default-staging", name: "Staging", pattern: "*staging*", type: "hostname", env: "staging", color: "#dd6b20", textColor: "#ffffff", enabled: true },
  { id: "default-prod", name: "Production", pattern: "*.example.com", type: "hostname", env: "production", color: "#e53e3e", textColor: "#ffffff", enabled: false }
];

const DEFAULT_SETTINGS = {
  globalEnabled: true,
  showBanner: true,
  showBadge: true,
  bannerPosition: "top"
};

function generateId() {
  return "rule-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

function validateRule(rule) {
  if (!rule || typeof rule !== "object") return false;
  if (typeof rule.id !== "string" || rule.id.length === 0) return false;
  if (typeof rule.pattern !== "string" || rule.pattern.length === 0) return false;
  if (!["hostname", "url"].includes(rule.type)) return false;
  if (typeof rule.color !== "string") return false;
  if (typeof rule.enabled !== "boolean") return false;
  return true;
}

async function getRules() {
  const { rules } = await chrome.storage.local.get({ rules: DEFAULT_RULES });
  return Array.isArray(rules) ? rules.filter(validateRule) : DEFAULT_RULES;
}

async function saveRules(rules) {
  if (!Array.isArray(rules)) throw new Error("rules must be an array");
  const valid = rules.filter(validateRule);
  await chrome.storage.local.set({ rules: valid });
  return valid;
}

async function getSettings() {
  const { settings } = await chrome.storage.local.get({ settings: DEFAULT_SETTINGS });
  return { ...DEFAULT_SETTINGS, ...settings };
}

async function saveSettings(settings) {
  if (!settings || typeof settings !== "object") throw new Error("invalid settings");
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  await chrome.storage.local.set({ settings: merged });
  return merged;
}

export {
  DEFAULT_RULES,
  DEFAULT_SETTINGS,
  generateId,
  validateRule,
  getRules,
  saveRules,
  getSettings,
  saveSettings
};
