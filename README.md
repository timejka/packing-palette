# Packing Palette

Helps you figure out what to pack for a trip. Search a destination, pick your
travel dates, and optionally flag your activities — get back real weather
data, a four-color palette pulled from actual photos of the place, and a
packing list sized to the trip.

Loads with a Safari to Kruger National Park, South Africa example so the
full flow is visible immediately.

## Running locally

```sh
npm install
npm run dev
```

Then open the printed local URL in your browser. All data fetching happens
client-side, directly against free public APIs — no backend and no API keys
to configure.

## How it works

- `src/lib/geocoding.js` — location autocomplete via Open-Meteo's geocoding
  API, resolving free-text search to a city, country, and coordinates.
- `src/lib/weather.js` — real weather via Open-Meteo. Trips inside the
  ~16-day forecast window get a live forecast; trips further out (the
  common case when packing) get actual observed weather for the same
  month/day range averaged across the last 5 years.
- `src/lib/images.js` — finds real, freely-licensed destination photos via
  the Wikimedia Commons search API.
- `src/lib/colorExtraction.js` — extracts a 4-color palette from each photo
  client-side, using median-cut color quantization over a canvas.
- `src/lib/colorNaming.js` — gives extracted colors human-friendly names
  based on their hue/saturation/lightness.
- `src/lib/packingList.js` — builds a categorized packing list, scaling
  quantities by trip length and adjusting for weather and selected
  activities.

If a live weather or image lookup fails (offline, no results, blocked
network), the app falls back to a seasonal heuristic or a procedurally
generated palette so the flow still completes end to end — clearly labeled
as an estimate.
