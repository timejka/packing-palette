// Fallback palette generator, used only when destination photos can't be
// found or their colors can't be extracted (offline, blocked, no results).
// Produces a deterministic but harmonious 4-color set from the place name.

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => Math.round(255 * f(x)).toString(16).padStart(2, "0");
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`;
}

export function getFallbackPalette(location) {
  const seed = (location?.label || location?.name || "trip").toLowerCase().trim();
  const hash = hashString(seed);
  const baseHue = hash % 360;

  return [
    hslToHex(baseHue, 55, 40),
    hslToHex((baseHue + 30) % 360, 50, 55),
    hslToHex((baseHue + 200) % 360, 40, 35),
    hslToHex((baseHue + 170) % 360, 45, 70),
  ];
}
