// Sample weather data. In a real version this would call a weather/climate API.
// For the MVP we use curated monthly climate profiles for a few well-known
// destinations, plus a hemisphere/season heuristic fallback for anywhere else.

const DESTINATIONS = [
  {
    match: /south africa|kruger|safari|serengeti|botswana|kenya|tanzania|namibia/i,
    name: "Southern/East African savanna",
    monthly: {
      1: { high: 30, low: 18, condition: "Hot & sunny", rain: "Occasional afternoon storms" },
      2: { high: 29, low: 18, condition: "Hot & sunny", rain: "Occasional afternoon storms" },
      3: { high: 27, low: 15, condition: "Warm & dry", rain: "Low rainfall" },
      4: { high: 24, low: 11, condition: "Mild & dry", rain: "Low rainfall" },
      5: { high: 21, low: 7, condition: "Cool days, cold nights", rain: "Very little rain" },
      6: { high: 19, low: 4, condition: "Cool days, cold nights", rain: "Dry season" },
      7: { high: 19, low: 4, condition: "Cool days, cold nights", rain: "Dry season" },
      8: { high: 22, low: 6, condition: "Mild days, cold nights", rain: "Dry season" },
      9: { high: 25, low: 10, condition: "Warm & dry", rain: "Dry season" },
      10: { high: 27, low: 13, condition: "Warm, building humidity", rain: "First rains possible" },
      11: { high: 28, low: 16, condition: "Hot & humid", rain: "Regular afternoon storms" },
      12: { high: 29, low: 17, condition: "Hot & humid", rain: "Regular afternoon storms" },
    },
    notes:
      "Game drives happen at dawn and dusk when it's coldest, even if the afternoon is warm. Layers matter more than raw temperature.",
  },
  {
    match: /london|uk|england|britain/i,
    name: "British Isles",
    monthly: {
      1: { high: 8, low: 3, condition: "Cold & overcast", rain: "Frequent light rain" },
      2: { high: 9, low: 3, condition: "Cold & overcast", rain: "Frequent light rain" },
      3: { high: 12, low: 4, condition: "Cool & breezy", rain: "Frequent light rain" },
      4: { high: 14, low: 6, condition: "Mild & breezy", rain: "Scattered showers" },
      5: { high: 18, low: 8, condition: "Mild", rain: "Scattered showers" },
      6: { high: 21, low: 12, condition: "Warm", rain: "Occasional showers" },
      7: { high: 23, low: 14, condition: "Warm", rain: "Occasional showers" },
      8: { high: 22, low: 13, condition: "Warm", rain: "Occasional showers" },
      9: { high: 19, low: 11, condition: "Mild", rain: "Scattered showers" },
      10: { high: 15, low: 8, condition: "Cool & breezy", rain: "Frequent light rain" },
      11: { high: 11, low: 5, condition: "Cold & overcast", rain: "Frequent rain" },
      12: { high: 8, low: 3, condition: "Cold & overcast", rain: "Frequent rain" },
    },
    notes: "Weather is changeable within a single day — pack for rain regardless of the season.",
  },
];

function monthTempCurve(hemisphere, month) {
  // Simple sinusoidal seasonal curve as a generic fallback.
  // Northern hemisphere peaks in July (month 7), Southern peaks in January.
  const peakMonth = hemisphere === "south" ? 1 : 7;
  const diff = Math.min(Math.abs(month - peakMonth), 12 - Math.abs(month - peakMonth));
  const seasonFactor = Math.cos((diff / 6) * Math.PI); // 1 at peak, -1 at opposite
  const high = Math.round(24 + seasonFactor * 10);
  const low = Math.round(14 + seasonFactor * 10);
  return { high, low };
}

const SOUTHERN_HEMISPHERE_HINTS =
  /south africa|australia|new zealand|argentina|chile|brazil|peru|zimbabwe|botswana|namibia|zambia|mozambique|uruguay|paraguay|bolivia|fiji|madagascar/i;

function guessHemisphere(location) {
  return SOUTHERN_HEMISPHERE_HINTS.test(location) ? "south" : "north";
}

function monthName(m) {
  return [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ][m - 1];
}

/**
 * Returns a weather summary for a location and date range.
 * Uses curated sample data for known destinations, otherwise a
 * hemisphere/season heuristic so the flow always produces a plausible result.
 */
export function getWeatherSummary(location, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startMonth = start.getMonth() + 1;
  const endMonth = end.getMonth() + 1;

  const known = DESTINATIONS.find((d) => d.match.test(location));

  const months = new Set([startMonth, endMonth]);
  let highs = [];
  let lows = [];
  let conditions = [];
  let rains = [];

  months.forEach((m) => {
    if (known) {
      const data = known.monthly[m];
      highs.push(data.high);
      lows.push(data.low);
      conditions.push(data.condition);
      rains.push(data.rain);
    } else {
      const hemisphere = guessHemisphere(location);
      const { high, low } = monthTempCurve(hemisphere, m);
      highs.push(high);
      lows.push(low);
      conditions.push(high > 22 ? "Warm" : high > 12 ? "Mild" : "Cool");
      rains.push("Typical seasonal rainfall");
    }
  });

  const highLo = Math.min(...highs);
  const highHi = Math.max(...highs);
  const lowLo = Math.min(...lows);
  const lowHi = Math.max(...lows);

  return {
    isEstimate: !known,
    label: known ? known.name : `${location} in ${monthName(startMonth)}${startMonth !== endMonth ? `–${monthName(endMonth)}` : ""}`,
    highRange: highLo === highHi ? `${highLo}°C` : `${highLo}–${highHi}°C`,
    lowRange: lowLo === lowHi ? `${lowLo}°C` : `${lowLo}–${lowHi}°C`,
    highMax: highHi,
    lowMin: lowLo,
    condition: [...new Set(conditions)].join(" / "),
    rain: [...new Set(rains)].join(" / "),
    rainy: rains.some((r) => /storm|shower|rain/i.test(r) && !/very little|low rainfall|dry season/i.test(r)),
    notes: known ? known.notes : "This is an estimate based on typical seasonal patterns — check a live forecast closer to departure.",
  };
}
