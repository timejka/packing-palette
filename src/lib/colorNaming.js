// Gives a human-friendly name to an arbitrary hex color, derived from its
// hue/saturation/lightness — used to label colors pulled out of a photo.

export function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: l * 100 };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
    case g: h = (b - r) / d + 2; break;
    default: h = (r - g) / d + 4;
  }
  return { h: h * 60, s: s * 100, l: l * 100 };
}

const HUE_NAMES = [
  { max: 15, name: "Red" },
  { max: 45, name: "Terracotta" },
  { max: 65, name: "Amber" },
  { max: 95, name: "Olive" },
  { max: 150, name: "Green" },
  { max: 195, name: "Teal" },
  { max: 250, name: "Blue" },
  { max: 285, name: "Indigo" },
  { max: 325, name: "Magenta" },
  { max: 361, name: "Rose" },
];

export function nameForColor(hex) {
  const { h, s, l } = hexToHsl(hex);

  if (s < 10) {
    if (l > 88) return "Ivory";
    if (l > 65) return "Stone Grey";
    if (l > 35) return "Charcoal";
    return "Near Black";
  }

  const base = HUE_NAMES.find((b) => h <= b.max)?.name || "Grey";
  const tone = l > 78 ? "Pale " : l < 22 ? "Deep " : s < 30 ? "Dusty " : "";
  return `${tone}${base}`;
}
