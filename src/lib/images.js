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

/**
 * Returns up to `count` real, iconic photos for a destination, each with a
 * thumbnail URL suitable for both display and client-side palette extraction.
 */
export async function getDestinationImages(location, count = 3) {
  const query = [location.name, location.country].filter(Boolean).join(" ");
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

  const usable = pages
    .filter(isUsableImage)
    .sort((a, b) => (a.index ?? 999) - (b.index ?? 999));

  return usable.slice(0, count).map((page) => {
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
  });
}
