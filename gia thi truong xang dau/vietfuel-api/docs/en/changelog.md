# Changelog

Evolution of **VietFuelAPI** towards the best developer experience.

---

## [Unreleased]

### ⏰ Adaptive Cron Schedule (Decree 80/2023/ND-CP)
- Replaced the fixed hourly cron with a 3-mode schedule backed by legal basis:
  - **Checking** (Mon–Wed): Every 4 hours — prices stable, conserve server resources.
  - **Hunting** (Thu, 14:30–16:00): Every 15 minutes — the window when MOIT announces new fuel prices.
  - **Maintenance** (Fri–Sun): Every 6 hours — prices settled, reduce bandwidth usage.
- Added legal citations in code comments: Decree 80/2023, 95/2021, 83/2014.
- Added `mode` field to job logs for operational monitoring.
- Full cron expressions (tested): `30,45 14 * * 4` and `0,15,30,45 15 * * 4`.

### 📡 New Endpoint: `GET /api/sources`
- Returns the full list of all 11 data sources with their current cache status.
- Fields returned: `id`, `label`, `url`, `populated`, `scrapedAt`, `ttlRemainingSeconds`, `isStale`.
- Provides transparency for the developer community to cross-reference data.

### 🔧 System-wide Stealth Optimization
- Moved `USER_AGENTS` pool, `pickRandomUA()`, and `humanDelay()` to `utils.js` — all scrapers calling `createBrowser()` now benefit automatically.
- Pool expanded to 5 popular UAs (added Linux/Chrome UA).
- Removed duplicate code from `pvoil.js`.

### ⚽ PVOil Upgrade — 3-Tier Fallback Strategy
- **Tier 1 — Stealth Direct**: Scrapes `pvoil.com.vn` directly with real-browser simulation techniques:
  - Rotates User-Agent from a pool of 4 popular UAs (Chrome/Firefox/Safari).
  - Random `humanDelay` waits (800ms–2500ms) after page load.
  - Mouse move + scroll simulation to mimic human reading.
- **Tier 2 — GXHN Fallback** (carried from previous version): Text scrape via `giaxanghomnay.com` — a public aggregator.
- **Tier 3 — Light HTTP Fetch** (new): Pure HTTPS call without Playwright (Node.js `https.get`) to static HTML aggregators (`petrotimes.vn`, `giaxang.vn`). Fully legal for a non-profit community project.
- Added `_tier` field to scraper result (1/2/3) so monitoring knows exactly which tier served the data.
- Improved log clarity: every failure logs `[Tier N] Failed:`, every success logs `[Tier N] Success from ...`.

### 📁 Documentation Structure Update
- Updated project directory tree in README (VI/EN) to accurately reflect the real codebase: added `workers/`, `tests/`, `utils/websocket.js`, `utils/fuel-helpers.js`, and all 10 scrapers.
- Added `docs/assets/` directory for README preview images.
- Added UI mockup preview image (`docs/assets/preview.png`) to both READMEs — visible on GitHub.

### 📘 GitHub Readiness & Community Docs
- Added community/legal files: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `SUPPORT.md`, `DISCLAIMER.md`.
- Added code comment convention doc: `docs/comment-style.md`.
- Updated README (VI/EN) for the new repository `TranQui004/vietfuel-api`, including legal scope and a push checklist.

### 🧹 Debug Structure Cleanup
- Moved PVOIL inspection script to `backend/tools/debug/inspect_pvoil.js`.
- Removed temporary HTML dump and updated `.gitignore` to block runtime debug artifacts.

### ⛽ PVOIL & Live UI Improvements
- Extracted PVOIL parser into `pvoil-parser.js` to simplify scraper maintenance.
- Normalized PVOIL output to 5 core products.
- Added `blockedByProtection` metadata when direct PVOIL source is blocked by Cloudflare and fallback is used.
- Expanded fuel cards and improved dual-region layout to prevent content clipping.
- Removed `Region 1/2` mode badge as requested, while keeping `Single` badge for single-price sources.


### ⚙️ Backend Refactoring (Architecture & System Stability)
- **Extracted Config Data**: Moved the 63 provinces definition array out of API logic into a static `backend/data/provinces.json` file.
- **Isolated Scraper Modules**: Split the monolithic `scraper.js` into 9 child files (8 scraper resources + 1 `utils.js`) placed under the `backend/services/scrapers/` directory, introducing robust modularity and easy Plug&Play capability for future API source upgrades.
- **Cloudflare Bypass for PVOil**: Updated the PVOil scraping module to use a text-extraction fallback strategy via the GiaXangHomNay intermediary, replacing direct Playwright headless interaction to completely resolve "Just a moment..." Cloudflare blocks.
- **Boot Resource Optimization**: Prevented multi-browser boot crashes by replacing parallel execution (`Promise.all`) with a **Sequential Execution** algorithm at server startup, completely eliminating Playwright Chromium RAM spikes.
- **Path Resolution Fix**: Applied absolute path parsing via `path.join(__dirname)` to locate `cache.json`, preventing cache drops on incorrect runtime execution directories.
- **Gzip/Brotli Compression (`compression`)**: Reduces API and page response size by ~70%, significantly improving load speed especially on mobile networks.
- **Security Hardening (`helmet`)**: Auto-applies full HTTP Security Headers suite (XSS Protection, Clickjacking, MIME Sniffing...) meeting production public API standards.
- **PM2 Deployment Config**: Added `ecosystem.config.js` for professional production server management with auto-restart, centralized log management, and environment-aware configuration.
- **Adaptive Stale Cache Mechanism**: Disabled auto-deletion of expired cache data (`stdTTL: 0`). If the crawler fails, the system retains the old data and appends an `isStale: true` flag to the JSON response to ensure the API never suffers a 503 downtime.

### 🎨 Frontend Redesign — UI & Experience

- **Mobile Responsive & Glassmorphism**: Redesigned the entire mobile responsive flow. Added background blur effects (backdrop-filter) to the Navigation Drawer resembling native apps, fine-tuned the gap spacing for Stats blocks, optimized spacing for CTA buttons, and restructured the Footer into a clean, left-aligned single column to prevent layout breaking across all phone screen sizes.

- **Accent color changed**: From amber yellow (`#f59e0b`) to signature orange (`#ff6300`) across the entire site.
- **Changelog page removed**: `changelog.html` now auto-redirects to GitHub docs — version history is centralized in the repository.
- **Terminal Demo merged into API Reference**: The 6-endpoint animated terminal demo has been moved to `endpoints.html#demo` — `/playground` redirects there automatically.
- **Animated SVG Architecture Diagram**: Replaced 6 feature cards on the homepage with an animated SVG showing data flow from 11 scraped sources → Engine → Default Endpoint/API Layer → Client apps.
- **Quickstart Tabs**: Added a Quickstart section with 3 tabs (cURL / JavaScript / Python) for first-time integrators.
- **Sponsor Section**: Added a Sponsors area with logo display (currently empty) and a registration form for both organizations and individuals.
- **Collapsible Endpoint Cards**: API Reference section 04 cards now toggle open/close — reduces page height and improves scanning UX.

### 🛠 Documentation & System Alignment
- **EJS View Architecture**: Migrated entire frontend structure from static `.html` files to the `EJS` view engine (`views/`, `views/partials/`) allowing deep reusability of modular components (Header, Footer, Icons).
- **Backend Smoke Tests Completed**: Implemented missing smoke test routines for the remaining scraper endpoints (`petrolimex`, `pvoil`, `mipec`, `webgia`, `giaxanghomnay`). Runnable via `npm run test`.
- **Single-port runtime**: Express now serves all frontend views (`/`, `/live`, `/endpoints`) directly on `localhost:3000`.
- **Backend scripts fixed**: Updated `start/dev/scrape` in `backend/package.json` to match the real `index.js` entrypoint; added `nodemon --ignore cache.json --ignore logs/**` to prevent restart loops.
- **Page-specific JavaScript binding fixes**: Correct script loading for Live/Endpoints/Changelog pages and remove invalid includes that caused runtime errors.
- **Legal section fixes**: Removed incompatible script on legal pages that broke legal list rendering.
- **Live default source improvement**: Align initial Live fetch with the Default Endpoint tab to reduce empty-state scenarios.
- **Startup 503 reduction**: Removed forced disk-cache clearing at bootstrap so fallback data remains available.
- **Comprehensive Markdown Refresh**: Updated README, changelog, and architecture docs (both EN/VI) to reflect the new EJS structure and CI Test suites.

## [1.0.0] — 2026-04-02

### ✨ Initial Release
- **Comprehensive Fuel API**: Real-time retail fuel price data in Vietnam (refreshed hourly).
- **Default Endpoint (`/api/fuel-prices`)**: The default endpoint aggregates the most accurate data into one call across 11 sources. Uses Petrolimex as the primary base, falls back to other sources for missing dates, and enriches output with linked/mirror sources when needed. Includes metadata on data origins (`meta.primarySource`, `meta.dataSources`).
- **11 Supported Sources**: Petrolimex + 3 Petrolimex mirrors, PVOil, Mipec, COMECO, Saigon Petro, Petro Times, WebGia, and GiaXangHomNay. Source-specific data is available via `/api/fuel-prices/:source`.
- **63 Provinces**: On-demand scraping per province (`/api/fuel-prices/province/:slug`). Accurately classifies Region 1, Region 2, and 4 Partial Region provinces.
- **Complete Documentation**: Interactive API Reference, Sandbox Playground, and Live Data Dashboard.
- **Security & Performance**: Built-in Rate Limiting (60/20 req/min) paired with an ultra-fast In-memory Cache & Disk Fallback system.
