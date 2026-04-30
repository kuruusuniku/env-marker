# EnvMarker

A Chrome extension that subtly shows which environment you're on — production, staging, dev, or local — so you never accidentally operate on the wrong one.

## Features

- **Subtle top-left label** — small, semi-transparent indicator that doesn't interfere with the page
- **Badge on extension icon** — shows PROD / STG / DEV / LOCAL at a glance
- **Keyword-based hostname matching** — if the hostname contains `local`, `dev`, `stg`, etc., it's detected automatically
- **Glob pattern support** — `*local*`, `dev.*`, `*.stg.*`, `127.0.0.1*`
- **Works with /etc/hosts** — custom domains like `myapp.local` or `myapp.test` are recognized
- **Rule priority** — first match wins, reorder in settings
- **Per-rule enable/disable** and global ON/OFF toggle
- **Import / Export** settings as JSON
- **Zero external dependencies** — no remote code, no network requests, all data stays in your browser
- **Manifest V3** — modern, secure Chrome extension architecture

## Install

### Option A: Download ZIP (no git required)

1. Go to the [repository page](https://github.com/kuruusuniku/env-marker)
2. Click the green **Code** button → **Download ZIP**
3. Unzip the downloaded file
4. Open Chrome and go to `chrome://extensions/`
5. Enable **Developer mode** (toggle in top-right)
6. Click **Load unpacked**
7. Select the unzipped `env-marker-main` folder

### Option B: git clone

1. Clone this repository:
   ```
   git clone https://github.com/kuruusuniku/env-marker.git
   ```
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** → Click **Load unpacked** → Select the `env-marker` folder

The extension icon will appear in the toolbar.

## インストール方法

### 方法A: ZIPダウンロード（gitが不要）

1. [リポジトリページ](https://github.com/kuruusuniku/env-marker) を開く
2. 緑色の **Code** ボタン → **Download ZIP** をクリック
3. ダウンロードしたZIPを展開する
4. Chrome で `chrome://extensions/` を開く
5. 右上の **デベロッパー モード** をONにする
6. **パッケージ化されていない拡張機能を読み込む** をクリック
7. 展開した `env-marker-main` フォルダを選択

### 方法B: git clone

1. リポジトリをクローン:
   ```
   git clone https://github.com/kuruusuniku/env-marker.git
   ```
2. Chrome で `chrome://extensions/` → **デベロッパー モード** ON → **パッケージ化されていない拡張機能を読み込む** → `env-marker` フォルダを選択

ツールバーに拡張機能のアイコンが表示されます。

## Usage

1. Click the extension icon to see the current page's environment
2. Use the **global toggle** to enable/disable
3. Click **Settings** to open the options page
4. Add or edit rules to match your environment naming conventions
5. Rules are evaluated top-to-bottom — **first match wins**

### Pattern Syntax

| Pattern | Matches |
|---------|---------|
| `*local*` | `localhost`, `myapp.local`, `local.test` |
| `dev.*` | `dev.example.com`, `dev.myapp.io` |
| `*.dev.*` | `app.dev.example.com` |
| `*stg*` | `stg.example.com`, `app-stg.internal` |
| `127.0.0.1*` | `127.0.0.1`, `127.0.0.1:3000` |

`*` matches any characters, `?` matches a single character. Matching is case-insensitive.

### Match Types

- **Hostname** — matches against the hostname only (e.g., `app.example.com`)
- **URL** — matches against the full URL (e.g., `https://app.example.com/admin*`)

## Default Rules

| Environment | Pattern | Color | Examples |
|-------------|---------|-------|----------|
| Local | `*local*` | Blue | `localhost`, `myapp.local`, `local.myapp.com` |
| Local | `127.0.0.1*` | Blue | `127.0.0.1`, `127.0.0.1:3000` |
| Development | `dev.*` | Green | `dev.example.com`, `dev.myapp.io` |
| Development | `*.dev.*` | Green | `app.dev.example.com`, `myapp.dev.internal` |
| Staging | `*stg*` | Orange | `stg.example.com`, `app.stg.internal` |
| Staging | `*staging*` | Orange | `staging.example.com` |
| Production | `*.example.com` | Red | Disabled by default — customize for your domains |

> **Note:** `.dev` is a real TLD (e.g., `web.dev`), so the dev rules use `dev.*` and `*.dev.*` instead of `*dev*` to avoid false positives.

Works with `/etc/hosts` custom domains, internal DNS, and any naming convention. Edit rules in Settings to match your infrastructure.

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
│   ├── content.js         # Label injection
│   └── content.css        # Label styles
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
