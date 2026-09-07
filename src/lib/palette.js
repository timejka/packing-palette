// Generates a four-color palette that evokes the destination.
// Known destinations get a curated palette; anything else gets a
// procedurally generated but harmonious palette derived from the place name.

const PALETTES = [
  {
    match: /south africa|kruger|safari|serengeti|botswana|kenya|tanzania|namibia/i,
    colors: [
      { hex: "#C98A4B", name: "Sunbaked Khaki" },
      { hex: "#8A6D3B", name: "Acacia Bark" },
      { hex: "#4F6B4B", name: "Bushveld Green" },
      { hex: "#D9752B", name: "Savanna Sunset" },
    ],
  },
  {
    match: /london|uk|england|britain/i,
    colors: [
      { hex: "#5B6770", name: "Overcast Grey" },
      { hex: "#2E4057", name: "Thames Navy" },
      { hex: "#8C3B3B", name: "Post Box Red" },
      { hex: "#7A8B6F", name: "Park Green" },
    ],
  },
];

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
  const toHex = (x) =>
    Math.round(255 * f(x)).toString(16).padStart(2, "0");
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`;
}

function generatePalette(location) {
  const hash = hashString(location.toLowerCase().trim());
  const baseHue = hash % 360;

  return [
    { hex: hslToHex(baseHue, 55, 40), name: "Base tone" },
    { hex: hslToHex((baseHue + 30) % 360, 50, 55), name: "Accent tone" },
    { hex: hslToHex((baseHue + 200) % 360, 40, 35), name: "Deep contrast" },
    { hex: hslToHex((baseHue + 170) % 360, 45, 70), name: "Light contrast" },
  ];
}

export function getDestinationPalette(location) {
  const known = PALETTES.find((p) => p.match.test(location));
  if (known) return known.colors;
  return generatePalette(location || "trip");
}
