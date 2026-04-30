# Environment Marker

A Chrome extension that visually marks web pages by environment (production, staging, development, local) with colored banners and action badges.

Identify which environment you're looking at — instantly, without checking the URL.

## Features

- **Color-coded banners** at the top/bottom of pages
- **Badge on extension icon** showing PROD / STG / DEV / LOCAL
- **Hostname or URL pattern matching** with glob syntax (`*.example.com`, `localhost*`)
- **Rule priority** — first match wins, drag to reorder
- **Per-rule enable/disable** and global ON/OFF toggle
- **Import / Export** settings as JSON
- **Zero external dependencies** — no remote code, no data leaves your browser
- **Manifest V3** — modern, secure extension architecture

## Install (Developer Mode)

1. Clone this repository:
   ```
   git clone https://github.com/<your-username>/env-marker.git
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `env-marker` folder

The extension icon will appear in the toolbar.

## Usage

1. Click the extension icon to see the current page's environment
2. Use the **global toggle** to enable/disable
3. Click **Settings** to open the options page
4. Add rules with hostname/URL patterns:
   - `localhost*` → Local (blue)
   - `*.stg.example.com` → Staging (orange)
   - `*.example.com` → Production (red)
5. Rules are evaluated top-to-bottom — **first match wins**

### Pattern Syntax

| Pattern | Matches |
|---------|---------|
| `localhost*` | `localhost`, `localhost:3000` |
| `*.stg.example.com` | `app.stg.example.com`, `api.stg.example.com` |
| `*.example.com` | `app.example.com`, `www.example.com` |
| `192.168.*` | `192.168.1.1`, `192.168.0.100` |

### Match Types

- **Hostname** — matches against the hostname only (e.g., `app.example.com`)
- **URL** — matches against the full URL (e.g., `https://app.example.com/admin*`)

## Default Rules

| Environment | Pattern | Color | Notes |
|-------------|---------|-------|-------|
| Local | `localhost*` | Blue | |
| Local | `127.0.0.1*` | Blue | |
| Local | `*.local` | Blue | /etc/hosts custom domains (e.g. `myapp.local`) |
| Local | `*.test` | Blue | RFC 2606 reserved TLD |
| Development | `*.dev.*` | Green | e.g. `app.dev.example.com` |
| Development | `*.internal` | Green | /etc/hosts or internal DNS |
| Staging | `*.stg.*` | Orange | |
| Staging | `*.staging.*` | Orange | |
| Production | `*.example.com` | Red | Disabled by default — customize for your domains |

Supports `/etc/hosts` custom domains: if you map `myapp.local` or `myapp.test` to `127.0.0.1`, these are detected automatically.

Edit rules in Settings to match your infrastructure.

## Permissions

| Permission | Reason |
|------------|--------|
| `storage` | Save rules and settings locally |
| `activeTab` | Read the current tab's URL for matching |

No host permissions. No network requests. All data stays local.

## Project Structure

```
env-marker/
├── manifest.json          # MV3 manifest (minimal permissions)
├── background/
│   └── service-worker.js  # Badge updates, message handling
├── content/
│   ├── content.js         # Banner injection
│   └── content.css        # Banner styles
├── popup/
│   ├── popup.html         # Quick status popup
│   └── popup.js
├── options/
│   ├── options.html       # Full settings page
│   └── options.js
├── shared/
│   ├── storage.js         # Storage I/O with validation
│   └── matcher.js         # URL/hostname matching logic
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## License

MIT
