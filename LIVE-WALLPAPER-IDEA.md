# Idea: a-bouquet-for-rain as an Offline Live Wallpaper (Android)

## Goal
Turn the bouquet site into an Android live wallpaper that:
- **Syncs once a day** with the internet (picks up latest content from GitHub Pages).
- **Works fully offline** the rest of the time (petals, hearts, cake rain, music all still work).
- Never becomes a battery hog.

## Why it's easy
The site is just **3 small files**:
- `index.html`
- `styles.css`
- `script.js`

Small = trivially cacheable. Everything (SVG flowers, WebAudio music, animations) is local — no backend.

## Step 1 — Make the site itself a PWA (server-side, ~30 lines)
Add to the repo:
- `sw.js` — service worker that precaches the 3 files on first visit and updates the cache on every visit / daily re-fetch.
- `manifest.webmanifest` — name "for Rain", theme color, icon, display mode.
- Register the worker in `index.html`.

GitHub Pages serves over HTTPS, so the service worker registers cleanly.

Result (free win):
- Open the site once online -> cached forever.
- Works offline afterwards on any device/browser.
- Push a new design -> auto-syncs next visit/day.
- Even Wallpaper Engine / web-wallpaper apps benefit from the PWA cache.

## Step 2 — Android live wallpaper app (vibe-coded)
A small Android Studio project (Kotlin, Jetpack):

- `WallpaperService` subclass.
- `WebView` inside it rendering the bouquet.
  - `setLayerType(View.LAYER_TYPE_HARDWARE, null)`
  - `android:hardwareAccelerated="true"`
- Load from a **local** URL using `WebViewAssetLoader` →
  - maps `https://bouquet.local/` to cached files on disk
  - → needs no internet after first sync.
- **Daily sync:** `WorkManager` periodic job (24h) downloads the 3 files from
  `https://artsbyankit.github.io/a-bouquet-for-rain/` and swaps them into the local cache.
- **Battery safety:**
  - Pause/stall the WebView when the wallpaper is not visible (e.g., another app fully covers it, or screen off).
  - Skip audio; the WebAudio music box is a button-triggered extra only.
  - Use the wallpaper `onOffsetsChanged`/visibility events to gate rendering.
- Manifest entry:
  ```xml
  <service android:name=".BouquetWallpaper"
           android:permission="android.permission.BIND_WALLPAPER"
           android:exported="true">
      <intent-filter>
          <action android:name="android.service.wallpaper.WallpaperService" />
      </intent-filter>
      <meta-data android:name="android.service.wallpaper"
                 android:resource="@xml/bouquet_wallpaper" />
  </service>
  ```
- Build `apk` -> sideload onto Rain's phone.

## Flow recap (offline-first)
1. First launch: app downloads the 3 files -> saves to app storage -> WebView renders from local cache. (Or user opens the site once in a browser = PWA caches it.)
2. Every day (WorkManager): re-download the 3 files; if offline, just keep yesterday's copy.
3. Wallpaper always renders from local files -> fast, offline, low battery.

## Cadence
- `WorkManager` daily sync: `PeriodicWorkRequestBuilder<SyncWorker>(24, HOURS)`

## Nice-to-haves (later)
- Auto-start the live wallpaper after install (permission-gated).
- Fade-in flourish on unlock / "Good morning, Rain" on 9 May.
- Add Google Fonts (Cormorant Garamond / Inter) to the cached bundle so offline typography matches the online version exactly.