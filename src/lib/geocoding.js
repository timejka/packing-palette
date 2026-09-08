// Location search backed by Open-Meteo's free geocoding API (no key required).
// https://open-meteo.com/en/docs/geocoding-api

const ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

export function formatLocationLabel(result) {
  return `${result.name}, ${result.country || result.countryCode || ""}`.replace(/, $/, "");
}

export async function searchLocations(query) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `${ENDPOINT}?name=${encodeURIComponent(trimmed)}&count=8&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Location search failed (${res.status})`);
  }
  const data = await res.json();
  const results = data.results || [];

  return results.map((r) => {
    const location = {
      id: r.id,
      name: r.name,
      country: r.country || r.country_code || "",
      admin1: r.admin1 || "",
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
      population: typeof r.population === "number" ? r.population : undefined,
      featureCode: r.feature_code,
    };
    location.label = formatLocationLabel(location);
    return location;
  });
}
