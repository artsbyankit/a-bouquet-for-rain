# a-bouquet-for-rain

A digital bouquet for Rain. Powder-blue, alive with falling petals, hearts and the occasional diamond. Double-click the title for a flower rain.

https://artsbyankit.github.io/a-bouquet-for-rain/

## Files

- `bouquet.js` — the bouquet artwork, random on each load; tune it with `COLOR_WEIGHTS`, the `*_SLOTS` tables and the `DRAW` flowers
- `falling.js` — falling petals, flower rain and the May 9 celebration
- `music.js` — the music box
- `liquidGlass.js` — refractive glass (Chromium; other browsers get frost)
- `styles.css`, `index.html`, `fonts/`

To change the photo, replace `photo.webp`.

## Running locally

It uses JavaScript modules, so it needs a local server rather than opening the file directly:

```bash
python -m http.server 5500
```
