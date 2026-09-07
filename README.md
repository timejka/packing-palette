# Packing Palette

Helps you figure out what to pack for a trip. Enter a destination, your travel
dates, and any activities — get back a weather summary, a four-color palette
inspired by the destination, and a packing list sized to the trip.

Loads with a Safari to Kruger National Park, South Africa (July 16–31)
example so the full flow is visible immediately.

## Running locally

```sh
npm install
npm run dev
```

Then open the printed local URL in your browser.

## How it works

- `src/lib/weather.js` — curated seasonal weather data for a few well-known
  destinations, with a hemisphere/season heuristic fallback for anywhere else.
- `src/lib/palette.js` — curated four-color palettes for known destinations,
  with a procedurally generated fallback derived from the place name.
- `src/lib/packingList.js` — builds a categorized packing list, scaling
  quantities by trip length and adding gear based on weather and selected
  activities.

There's no backend or real weather API in this first version — all data is
generated locally so the full flow works end to end.
