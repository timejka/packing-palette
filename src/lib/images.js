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

/**
 * Returns up to `count` real, iconic photos for a destination, each with a
 * thumbnail URL suitable for both display and client-side palette extraction.
 *
 * Biases toward scenic/landscape shots first (more editorial, less likely to
 * be a random document scan or portrait), falling back to a plain place-name
 * search if that's too narrow for a given destination.
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

  const scenic = await searchUsableImages(`${place} landscape`);
  if (scenic.length >= count) {
    return scenic.slice(0, count).map(toDestinationImage);
  }

  const broad = await searchUsableImages(place);
  const seen = new Set(scenic.map((p) => p.pageid));
  const merged = [...scenic, ...broad.filter((p) => !seen.has(p.pageid))];

  return merged.slice(0, count).map(toDestinationImage);
}
