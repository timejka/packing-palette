// Finds real, freely-licensed destination photos via the Wikimedia Commons
// search API (no key required, CORS enabled via origin=*).
// https://www.mediawiki.org/wiki/API:Search

import { loadImageForExtraction, extractPalette } from "./colorExtraction";
import { hexToHsl } from "./colorNaming";

const ENDPOINT = "https://commons.wikimedia.org/w/api.php";

const EXCLUDE_PATTERN =
  /logo|icon|flag_of|locator|coat.?of.?arms|seal.?of|symbol|emblem|\bmap\b|signage|logotype|wordmark|favicon|banner/i;

function isUsableImage(page) {
  const info = page.imageinfo?.[0];
  if (!info || !info.width || !info.height) return false;
  if (!/^image\/(jpeg|png)$/.test(info.mime)) return false;
  if (EXCLUDE_PATTERN.test(page.title)) return false;
  if (info.width < 800 || info.height < 500) return false;
  const aspect = info.width / info.height;
  if (aspect > 2.4 || aspect < 0.4) return false;
  return true;
}

function stripHtml(html) {
  if (!html) return undefined;
  const text = html.replace(/<[^>]+>/g, "").trim();
  return text || undefined;
}

async function searchUsableImages(query) {
  const url =
    `${ENDPOINT}?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}` +
    `&gsrnamespace=6&gsrlimit=25&prop=imageinfo&iiprop=url|size|mime|extmetadata` +
    `&iiurlwidth=1000&format=json&origin=*`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Image search failed (${res.status})`);
  }
  const data = await res.json();
  const pages = Object.values(data.query?.pages || {});

  return pages.filter(isUsableImage).sort((a, b) => (a.index ?? 999) - (b.index ?? 999));
}

function toDestinationImage(page, palette) {
  const info = page.imageinfo[0];
  const meta = info.extmetadata || {};
  return {
    title: page.title.replace(/^File:/, "").replace(/\.[a-zA-Z]+$/, ""),
    thumbUrl: info.thumburl || info.url,
    fullUrl: info.url,
    descriptionUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
    artist: stripHtml(meta.Artist?.value),
    licenseShortName: meta.LicenseShortName?.value,
    palette: palette && palette.length > 0 ? palette : undefined,
  };
}

// How different two dominant colors need to be (circular hue degrees, or
// lightness percentage points when hue is unreliable) to count as visually
// distinct paint chips. Tuned to reject near-duplicate greens/blues without
// being so strict that thin destinations can't ever fill 3 slots.
const MIN_HUE_DISTANCE = 40;
const MIN_LIGHTNESS_DISTANCE = 15;

export function hueDistance(a, b) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Whether `candidate` (an {h,l} from hexToHsl, or null if unknown) is
 * distinct enough from every color already picked. A null/unknown color on
 * either side is never treated as a collision — we'd rather show an
 * un-color-checked image than silently drop it and undershoot `count`.
 */
export function isColorDistinct(candidate, pickedColors) {
  if (!candidate) return true;
  return pickedColors.every((color) => {
    if (!color) return true;
    // Hue is noisy for near-black/near-white colors (barely any chroma to
    // measure it from), so for those, lightness alone decides similarity.
    const bothNearBlack = candidate.l < 12 && color.l < 12;
    const bothNearWhite = candidate.l > 92 && color.l > 92;
    if (bothNearBlack || bothNearWhite) {
      return Math.abs(candidate.l - color.l) >= MIN_LIGHTNESS_DISTANCE;
    }
    const hueDiff = hueDistance(candidate.h, color.h);
    const lightDiff = Math.abs(candidate.l - color.l);
    return hueDiff >= MIN_HUE_DISTANCE || lightDiff >= MIN_LIGHTNESS_DISTANCE;
  });
}

// Loads a candidate's thumbnail and extracts its palette client-side, same
// as the display-time extraction (useImagePalette), so we can both (a)
// check the dominant color for similarity against already-picked images and
// (b) hand the finished palette to the UI to avoid extracting it twice.
// Returns null if the image can't be loaded or the canvas gets tainted
// (missing CORS headers) — callers treat that as "unknown color", not a
// hard failure, so a candidate is never rejected just because we couldn't
// analyze it.
async function analyzeCandidate(page) {
  const info = page.imageinfo[0];
  const url = info.thumburl || info.url;
  try {
    const img = await loadImageForExtraction(url);
    const palette = extractPalette(img, 4);
    if (!palette.length) return null;
    return { hsl: hexToHsl(palette[0]), palette };
  } catch {
    return null;
  }
}

const ANALYZE_BATCH_SIZE = 8;

// Walks `candidates` in relevance order, analyzing them in small parallel
// batches (rather than one giant Promise.all, which would load every
// candidate's image even after we already have enough picks) and greedily
// keeping ones whose dominant color is distinct from every pick so far.
// Anything skipped for being too similar is recorded in `skipped` so the
// caller can fall back to it if strict diversity leaves us short.
async function selectDiverseInto(candidates, picked, skipped, count) {
  for (let i = 0; i < candidates.length && picked.length < count; i += ANALYZE_BATCH_SIZE) {
    const batch = candidates.slice(i, i + ANALYZE_BATCH_SIZE);
    const analyses = await Promise.all(batch.map(analyzeCandidate));
    batch.forEach((page, idx) => {
      if (picked.length >= count) return;
      const analysis = analyses[idx];
      const pickedColors = picked.map((p) => p.analysis?.hsl || null);
      if (isColorDistinct(analysis?.hsl || null, pickedColors)) {
        picked.push({ page, analysis });
      } else {
        skipped.push(page);
      }
    });
  }
}

/**
 * Returns up to `count` real, iconic photos for a destination, each with a
 * thumbnail URL suitable for display and a `palette` already extracted from
 * it (see analyzeCandidate), biased toward scenic/landscape shots first —
 * more editorial, less likely to be a random document scan, news photo, or
 * unrelated building — falling back to a plain place-name search if that's
 * too narrow for a given destination.
 *
 * Both queries rely on Commons search (CirrusSearch) treating bare,
 * space-separated terms as AND — every term must match. Do NOT introduce a
 * bare `OR` here: CirrusSearch breaks the implicit AND grouping at that
 * point, turning trailing terms into independent top-level clauses. E.g.
 * `Seoul South Korea landscape OR scenery OR skyline` stops requiring "Seoul"
 * for the "skyline" branch, so it also matches any unrelated photo anywhere
 * on Commons whose title merely contains the word "skyline" (Prague,
 * Frankfurt, Jersey City, ...). If a future change wants an OR of
 * descriptors, it must be parenthesized *and* the place name must be
 * required on every branch, e.g. `+"Seoul" +"South Korea" (landscape OR
 * scenery OR skyline)` — and that should be verified against the live API
 * before shipping, since query-string parsing quirks are easy to get wrong.
 *
 * On top of the query, results are filtered for color diversity: each
 * candidate's dominant color is compared against the images already picked
 * (isColorDistinct), so 3 photos that all happen to be dominated by the
 * same green/blue don't all get picked just because they ranked highest.
 * If a destination doesn't have enough color-distinct coverage to fill
 * `count` this way, the most-similar candidates we skipped are used to fill
 * the remaining slots rather than under-delivering images.
 */
export async function getDestinationImages(location, count = 3) {
  const place = [location.name, location.country].filter(Boolean).join(" ");

  const scenic = await searchUsableImages(`${place} landscape`).catch(() => []);
  const picked = [];
  const skipped = [];

  await selectDiverseInto(scenic, picked, skipped, count);

  if (picked.length < count) {
    const broad = await searchUsableImages(place).catch(() => []);
    const seen = new Set(scenic.map((p) => p.pageid));
    const fresh = broad.filter((p) => !seen.has(p.pageid));
    await selectDiverseInto(fresh, picked, skipped, count);
  }

  for (const page of skipped) {
    if (picked.length >= count) break;
    picked.push({ page, analysis: null });
  }

  return picked.slice(0, count).map((p) => toDestinationImage(p.page, p.analysis?.palette));
}
