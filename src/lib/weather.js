// Real weather for a location and date range, backed by Open-Meteo's free
// APIs (no key required): https://open-meteo.com/
//
// - Trips landing inside the ~16-day forecast window use the live forecast.
// - Trips further out (the common case for packing) use the archive API to
//   pull actual observed weather for the same month/day range across the
//   last several years, averaged into a seasonal expectation.

const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";
const ARCHIVE_ENDPOINT = "https://archive-api.open-meteo.com/v1/archive";
const DAILY_FIELDS = "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code";
const HISTORICAL_YEARS_BACK = 5;
const RAIN_THRESHOLD_MM = 1;

const WEATHER_CODE_GROUPS = [
  { codes: [0, 1], group: "clear", label: "Clear" },
  { codes: [2, 3], group: "cloudy", label: "Cloudy" },
  { codes: [45, 48], group: "fog", label: "Foggy" },
  { codes: [51, 53, 55, 56, 57], group: "drizzle", label: "Drizzly" },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], group: "rain", label: "Rainy" },
  { codes: [71, 73, 75, 77, 85, 86], group: "snow", label: "Snowy" },
  { codes: [95, 96, 99], group: "storm", label: "Thunderstorms" },
];

function groupForCode(code) {
  return WEATHER_CODE_GROUPS.find((g) => g.codes.includes(code)) || WEATHER_CODE_GROUPS[0];
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, n) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

function parseIsoDate(str) {
  return new Date(`${str}T00:00:00Z`);
}

function withYear(dateStr, year) {
  const [, month, day] = dateStr.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const clampedDay = Math.min(day, daysInMonth);
  return `${year}-${String(month).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather request failed (${res.status})`);
  }
  return res.json();
}

function round(n) {
  return Math.round(n);
}

function summarize(daily, { location, source, sampleYears, dayCount }) {
  const highs = (daily.temperature_2m_max || []).filter((v) => v != null);
  const lows = (daily.temperature_2m_min || []).filter((v) => v != null);
  const precip = (daily.precipitation_sum || []).filter((v) => v != null);
  const codes = (daily.weather_code || []).filter((v) => v != null);

  if (highs.length === 0 || lows.length === 0) {
    throw new Error("No weather data returned for this date range.");
  }

  const highMin = round(Math.min(...highs));
  const highMax = round(Math.max(...highs));
  const lowMin = round(Math.min(...lows));
  const lowMax = round(Math.max(...lows));

  const rainyDayCount = precip.filter((p) => p >= RAIN_THRESHOLD_MM).length;
  const rainChancePct = precip.length ? round((rainyDayCount / precip.length) * 100) : 0;

  const groupCounts = {};
  codes.forEach((c) => {
    const { group } = groupForCode(c);
    groupCounts[group] = (groupCounts[group] || 0) + 1;
  });
  const dominantGroup = Object.entries(groupCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const dominantLabel =
    WEATHER_CODE_GROUPS.find((g) => g.group === dominantGroup)?.label || "Mixed conditions";

  const swing = highMax - lowMin;
  let notes;
  if (source === "forecast") {
    notes = "This is a live forecast for your travel dates.";
  } else {
    notes = `Based on actual weather from the last ${sampleYears} year${sampleYears === 1 ? "" : "s"} for these dates — a typical range, not a guarantee.`;
  }
  if (swing >= 12) {
    notes += " Expect a big swing between day and night temperatures — pack layers.";
  }

  return {
    source,
    isEstimate: source !== "forecast",
    label: location.label || location.name,
    highRange: highMin === highMax ? `${highMin}°C` : `${highMin}–${highMax}°C`,
    lowRange: lowMin === lowMax ? `${lowMin}°C` : `${lowMin}–${lowMax}°C`,
    highMax,
    lowMin,
    condition: dominantLabel,
    rain:
      rainChancePct === 0
        ? "Rain unlikely"
        : `Rain on roughly ${rainChancePct}% of days like these`,
    rainy: rainChancePct >= 30,
    notes,
    dayCount,
    sampleYears,
  };
}

/**
 * Fetches a weather summary for a location and date range.
 * `location` must include { latitude, longitude } (from geocoding.js).
 */
export async function getWeatherSummary(location, startDate, endDate) {
  if (!location || location.latitude == null || location.longitude == null) {
    throw new Error("A resolved location with coordinates is required.");
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  const dayCount = Math.round((end - start) / 86400000) + 1;

  const forecastWindowStart = addDays(today, -5);
  const forecastWindowEnd = addDays(today, 15);
  const fitsForecastWindow =
    start <= forecastWindowEnd && end >= forecastWindowStart && end <= forecastWindowEnd;

  if (fitsForecastWindow) {
    const clampedStart = start < forecastWindowStart ? forecastWindowStart : start;
    const url =
      `${FORECAST_ENDPOINT}?latitude=${location.latitude}&longitude=${location.longitude}` +
      `&daily=${DAILY_FIELDS}&timezone=auto&start_date=${isoDate(clampedStart)}&end_date=${isoDate(end)}`;
    const data = await fetchJson(url);
    return summarize(data.daily, { location, source: "forecast", dayCount });
  }

  const currentYear = today.getUTCFullYear();
  const years = Array.from({ length: HISTORICAL_YEARS_BACK }, (_, i) => currentYear - 1 - i);

  const responses = await Promise.all(
    years.map((year) => {
      const s = withYear(startDate, year);
      const e = withYear(endDate, year);
      const url =
        `${ARCHIVE_ENDPOINT}?latitude=${location.latitude}&longitude=${location.longitude}` +
        `&daily=${DAILY_FIELDS}&timezone=auto&start_date=${s}&end_date=${e}`;
      return fetchJson(url).catch(() => null);
    })
  );

  const usable = responses.filter((r) => r && r.daily);
  if (usable.length === 0) {
    throw new Error("No historical weather data available for this location.");
  }

  const merged = {
    temperature_2m_max: [],
    temperature_2m_min: [],
    precipitation_sum: [],
    weather_code: [],
  };
  usable.forEach((r) => {
    merged.temperature_2m_max.push(...(r.daily.temperature_2m_max || []));
    merged.temperature_2m_min.push(...(r.daily.temperature_2m_min || []));
    merged.precipitation_sum.push(...(r.daily.precipitation_sum || []));
    merged.weather_code.push(...(r.daily.weather_code || []));
  });

  return summarize(merged, {
    location,
    source: "historical-average",
    sampleYears: usable.length,
    dayCount,
  });
}

// Used only when live weather can't be reached at all (offline, API down),
// so the app still produces a plausible result end to end.
export function getFallbackWeatherEstimate(location, startDate) {
  const start = parseIsoDate(startDate);
  const month = start.getUTCMonth() + 1;
  const southernHints =
    /south africa|australia|new zealand|argentina|chile|brazil|peru|zimbabwe|botswana|namibia|zambia|mozambique/i;
  const hemisphere = southernHints.test(location.country || location.label || "") ? "south" : "north";
  const peakMonth = hemisphere === "south" ? 1 : 7;
  const diff = Math.min(Math.abs(month - peakMonth), 12 - Math.abs(month - peakMonth));
  const seasonFactor = Math.cos((diff / 6) * Math.PI);
  const highMax = round(24 + seasonFactor * 10);
  const lowMin = round(14 + seasonFactor * 10) - 6;

  return {
    source: "fallback-estimate",
    isEstimate: true,
    label: location.label || location.name,
    highRange: `${highMax}°C`,
    lowRange: `${lowMin}°C`,
    highMax,
    lowMin,
    condition: highMax > 22 ? "Warm" : highMax > 12 ? "Mild" : "Cool",
    rain: "Unknown — live data unavailable",
    rainy: false,
    notes: "Live weather data couldn't be reached, so this is a rough seasonal guess. Check a forecast closer to departure.",
  };
}
