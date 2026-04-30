/**
 * Options page script — rule editor, settings management, import/export.
 */

const DEFAULT_RULES = [
  {
    id: "default-prod", name: "Production", pattern: "*.example.com",
    type: "hostname", env: "production", color: "#e53e3e", textColor: "#ffffff", enabled: true
  },
  {
    id: "default-stg", name: "Staging", pattern: "*.stg.example.com",
    type: "hostname", env: "staging", color: "#dd6b20", textColor: "#ffffff", enabled: true
  },
  {
    id: "default-dev", name: "Development", pattern: "*.dev.example.com",
    type: "hostname", env: "development", color: "#38a169", textColor: "#ffffff", enabled: true
  },
  {
    id: "default-local", name: "Local", pattern: "localhost*",
    type: "hostname", env: "local", color: "#3182ce", textColor: "#ffffff", enabled: true
  }
];

const DEFAULT_SETTINGS = {
  globalEnabled: true,
  showBanner: true,
  showBadge: true,
  bannerPosition: "top"
};

const ENV_OPTIONS = ["production", "staging", "development", "local", "custom"];

function generateId() {
  return "rule-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

// DOM refs
const globalEnabled = document.getElementById("globalEnabled");
const showBanner = document.getElementById("showBanner");
const showBadge = document.getElementById("showBadge");
const bannerPosition = document.getElementById("bannerPosition");
const rulesList = document.getElementById("rulesList");
const addRuleBtn = document.getElementById("addRule");
const exportBtn = document.getElementById("exportRules");
const importBtn = document.getElementById("importRules");
const importFile = document.getElementById("importFile");
const toast = document.getElementById("toast");

let currentRules = [];

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

async function loadSettings() {
  const { settings } = await chrome.storage.local.get({ settings: DEFAULT_SETTINGS });
  const s = { ...DEFAULT_SETTINGS, ...settings };
  globalEnabled.checked = s.globalEnabled;
  showBanner.checked = s.showBanner;
  showBadge.checked = s.showBadge;
  bannerPosition.value = s.bannerPosition;
}

async function saveCurrentSettings() {
  const settings = {
    globalEnabled: globalEnabled.checked,
    showBanner: showBanner.checked,
    showBadge: showBadge.checked,
    bannerPosition: bannerPosition.value
  };
  await chrome.storage.local.set({ settings });
  notifyUpdate();
  showToast("Settings saved");
}

async function loadRules() {
  const { rules } = await chrome.storage.local.get({ rules: DEFAULT_RULES });
  currentRules = Array.isArray(rules) ? rules : DEFAULT_RULES;
  renderRules();
}

async function saveCurrentRules() {
  await chrome.storage.local.set({ rules: currentRules });
  notifyUpdate();
  showToast("Rules saved");
}

function notifyUpdate() {
  chrome.runtime.sendMessage({ type: "SETTINGS_UPDATED" });
  // Also tell all tabs to refresh banners
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: "REFRESH_BANNER" }).catch(() => {});
      }
    }
  });
}

function renderRules() {
  rulesList.innerHTML = "";
  currentRules.forEach((rule, index) => {
    const item = document.createElement("div");
    item.className = "rule-item" + (rule.enabled ? "" : " disabled");
    item.innerHTML = `
      <div class="rule-header">
        <span class="rule-env-badge" style="background:${rule.color};color:${rule.textColor || '#fff'}">
          ${rule.name || rule.env}
        </span>
        <label class="toggle">
          <input type="checkbox" data-index="${index}" data-field="enabled" ${rule.enabled ? "checked" : ""}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="rule-fields">
        <div>
          <label>Pattern</label>
          <input type="text" data-index="${index}" data-field="pattern" value="${escapeHtml(rule.pattern)}" placeholder="*.example.com">
        </div>
        <div>
          <label>Match Type</label>
          <select data-index="${index}" data-field="type">
            <option value="hostname" ${rule.type === "hostname" ? "selected" : ""}>Hostname</option>
            <option value="url" ${rule.type === "url" ? "selected" : ""}>URL</option>
          </select>
        </div>
        <div>
          <label>Name</label>
          <input type="text" data-index="${index}" data-field="name" value="${escapeHtml(rule.name || "")}" placeholder="Display name">
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="rule-colors">
          <div>
            <label>Environment</label><br>
            <select data-index="${index}" data-field="env" style="width:auto">
              ${ENV_OPTIONS.map(e => `<option value="${e}" ${rule.env === e ? "selected" : ""}>${e}</option>`).join("")}
            </select>
          </div>
          <div>
            <label>BG Color</label><br>
            <input type="color" data-index="${index}" data-field="color" value="${rule.color}">
          </div>
          <div>
            <label>Text</label><br>
            <input type="color" data-index="${index}" data-field="textColor" value="${rule.textColor || "#ffffff"}">
          </div>
        </div>
        <div class="rule-actions">
          ${index > 0 ? `<button class="btn btn-sm" data-action="up" data-index="${index}" style="background:#eee">&#9650;</button>` : ""}
          ${index < currentRules.length - 1 ? `<button class="btn btn-sm" data-action="down" data-index="${index}" style="background:#eee">&#9660;</button>` : ""}
          <button class="btn btn-sm btn-danger" data-action="delete" data-index="${index}">Delete</button>
        </div>
      </div>
    `;
    rulesList.appendChild(item);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Event delegation for rule changes
rulesList.addEventListener("change", (e) => {
  const { index, field } = e.target.dataset;
  if (index === undefined || !field) return;
  const i = parseInt(index, 10);

  if (field === "enabled") {
    currentRules[i].enabled = e.target.checked;
  } else {
    currentRules[i][field] = e.target.value;
  }
  saveCurrentRules();
  renderRules();
});

rulesList.addEventListener("input", (e) => {
  const { index, field } = e.target.dataset;
  if (index === undefined || !field) return;
  const i = parseInt(index, 10);
  currentRules[i][field] = e.target.value;
});

// Debounced save on text input
let saveTimer;
rulesList.addEventListener("input", () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveCurrentRules(), 500);
});

// Rule actions (delete, move)
rulesList.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  const i = parseInt(btn.dataset.index, 10);

  if (action === "delete") {
    currentRules.splice(i, 1);
  } else if (action === "up" && i > 0) {
    [currentRules[i - 1], currentRules[i]] = [currentRules[i], currentRules[i - 1]];
  } else if (action === "down" && i < currentRules.length - 1) {
    [currentRules[i], currentRules[i + 1]] = [currentRules[i + 1], currentRules[i]];
  }
  saveCurrentRules();
  renderRules();
});

// Add rule
addRuleBtn.addEventListener("click", () => {
  currentRules.push({
    id: generateId(),
    name: "New Rule",
    pattern: "*.example.com",
    type: "hostname",
    env: "custom",
    color: "#718096",
    textColor: "#ffffff",
    enabled: true
  });
  saveCurrentRules();
  renderRules();
  // Scroll to bottom
  rulesList.lastElementChild?.scrollIntoView({ behavior: "smooth" });
});

// Settings listeners
[globalEnabled, showBanner, showBadge, bannerPosition].forEach((el) => {
  el.addEventListener("change", saveCurrentSettings);
});

// Export
exportBtn.addEventListener("click", async () => {
  const { rules } = await chrome.storage.local.get({ rules: [] });
  const { settings } = await chrome.storage.local.get({ settings: DEFAULT_SETTINGS });
  const data = JSON.stringify({ rules, settings }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "env-marker-config.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("Exported!");
});

// Import
importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.rules && Array.isArray(data.rules)) {
        await chrome.storage.local.set({ rules: data.rules });
      }
      if (data.settings && typeof data.settings === "object") {
        await chrome.storage.local.set({ settings: data.settings });
      }
      await loadSettings();
      await loadRules();
      notifyUpdate();
      showToast("Imported!");
    } catch {
      showToast("Invalid file");
    }
  };
  reader.readAsText(file);
  importFile.value = "";
});

// Init
loadSettings();
loadRules();
