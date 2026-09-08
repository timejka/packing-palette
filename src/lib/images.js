// Finds real, freely-licensed destination photos via the Wikimedia Commons
// search API (no key required, CORS enabled via origin=*).
// https://www.mediawiki.org/wiki/API:Search

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

function toDestinationImage(page) {
  const info = page.imageinfo[0];
  const meta = info.extmetadata || {};
  return {
    title: page.title.replace(/^File:/, "").replace(/\.[a-zA-Z]+$/, ""),
    thumbUrl: info.thumburl || info.url,
    fullUrl: info.url,
    descriptionUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
    artist: stripHtml(meta.Artist?.value),
    licenseShortName: meta.LicenseShortName?.value,
  };
}

// GeoNames feature codes (surfaced by Open-Meteo's geocoding API as
// `feature_code`) that clearly identify a natural/protected feature rather
// than a populated place. Deliberately narrow to codes we're confident
// about — an unrecognized code just falls through to the population-based
// guess below rather than risking a wrong nature/city call.
const NATURE_FEATURE_CODES = /^(PRK|RESV|FRST|MT|MTS|VAL|CNYN|DSRT|ISL|ISLS|LK|RF)/;

const CITY_POPULATION_THRESHOLD = 300_000;

/**
 * Picks a scenery descriptor to bias the Commons search toward photos that
 * actually match the destination's character, instead of a single
 * one-size-fits-all "landscape" (which skews every result green/blue, even
 * for dense cities) or a bare OR of alternatives (which breaks the AND
 * grouping — see the warning in getDestinationImages below).
 *
 * Uses whatever geocoding data is available (feature_code, population) to
 * classify the destination:
 *   - a recognized park/mountain/island/etc. feature code -> "landscape"
 *   - a big population -> "skyline"
 *   - a smaller-but-known population -> "landmarks"
 *   - nothing to go on (e.g. the hardcoded default trip location, or a
 *     geocoding result missing this data) -> "landscape", since unranked
 *     places are more often a natural feature than a city GeoNames tracks
 *     precisely.
 */
function pickSceneryTerm(location) {
  if (NATURE_FEATURE_CODES.test(location.featureCode || "")) {
    return "landscape";
  }
  if (typeof location.population === "number") {
    if (location.population >= CITY_POPULATION_THRESHOLD) return "skyline";
    if (location.population > 0) return "landmarks";
  }
  return "landscape";
}

/**
 * Returns up to `count` real, iconic photos for a destination, each with a
 * thumbnail URL suitable for both display and client-side palette extraction.
 *
 * Biases toward scenic shots first (more editorial, less likely to be a
 * random document scan or portrait), using a descriptor picked for the
 * destination's actual character (see pickSceneryTerm) rather than always
 * "landscape". Falls back to a plain place-name search if that's too narrow
 * for a given destination.
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
 */
export async function getDestinationImages(location, count = 3) {
  const place = [location.name, location.country].filter(Boolean).join(" ");
  const sceneryTerm = pickSceneryTerm(location);

  const scenic = await searchUsableImages(`${place} ${sceneryTerm}`);
  if (scenic.length >= count) {
    return scenic.slice(0, count).map(toDestinationImage);
  }

  const broad = await searchUsableImages(place);
  const seen = new Set(scenic.map((p) => p.pageid));
  const merged = [...scenic, ...broad.filter((p) => !seen.has(p.pageid))];

  return merged.slice(0, count).map(toDestinationImage);
}
