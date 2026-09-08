import { useEffect, useState } from "react";
import TripForm from "./components/TripForm";
import TravelPass from "./components/TravelPass";
import PackingList from "./components/PackingList";
import StarField from "./components/StarField";
import RunningCat from "./components/RunningCat";
import catLogo from "./assets/cat-logo.png";
import { getWeatherSummary, getFallbackWeatherEstimate } from "./lib/weather";
import { getDestinationImages } from "./lib/images";
import { getFallbackPalette } from "./lib/palette";
import { generatePackingList } from "./lib/packingList";
import "./App.css";

const DEFAULT_LOCATION = {
  id: "durres-albania",
  name: "Durrës",
  country: "Albania",
  admin1: "Durrës County",
  latitude: 41.3231,
  longitude: 19.4414,
  population: 113249,
  featureCode: "PPLA",
  label: "Durrës, Albania",
};

const DEFAULT_TRIP = {
  location: DEFAULT_LOCATION,
  startDate: "2026-09-10",
  endDate: "2026-09-17",
  activities: ["outdoors"],
};

function daysBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

export default function App() {
  const [trip, setTrip] = useState(DEFAULT_TRIP);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [result, setResult] = useState(null);
  const [formError, setFormError] = useState(null);

  async function buildResult(t) {
    const days = daysBetween(t.startDate, t.endDate);

    const weatherPromise = getWeatherSummary(t.location, t.startDate, t.endDate).catch((err) => {
      console.warn("Live weather unavailable, using fallback estimate:", err);
      return getFallbackWeatherEstimate(t.location, t.startDate, t.endDate);
    });
    const imagesPromise = getDestinationImages(t.location).catch((err) => {
      console.warn("Destination image search unavailable:", err);
      return [];
    });

    const [weather, images] = await Promise.all([weatherPromise, imagesPromise]);
    const packingList = generatePackingList({ days, weather, activities: t.activities });
    const fallbackPalette = images.length === 0 ? getFallbackPalette(t.location) : null;

    return { weather, images, fallbackPalette, packingList, days, locationLabel: t.location.label };
  }

  async function runForTrip(t) {
    setStatus("loading");
    setFormError(null);
    try {
      const r = await buildResult(t);
      setResult(r);
      setStatus("ready");
    } catch (err) {
      console.error("Failed to build packing list:", err);
      setStatus("error");
    }
  }

  useEffect(() => {
    runForTrip(DEFAULT_TRIP);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit() {
    if (!trip.location) {
      setFormError("Pick a location from the suggestions list.");
      return;
    }
    runForTrip(trip);
  }

  return (
    <>
      <StarField />
      <RunningCat />
      <div className="app">
        <header className="app-header">
          <span className="eyebrow">Kitten Candy's Packing Wizard 🐈‍⬛</span>
          <h1>
            <img src={catLogo} alt="" className="header-mark" />
            Packing Palette
          </h1>
          <p className="app-tagline">
            Search a place, pick your dates — get the weather, the palette, and a packing list
            that changes based on the activities you choose.
          </p>
        </header>

        <main className="app-main">
          <TripForm
            trip={trip}
            onChange={setTrip}
            onSubmit={handleSubmit}
            formError={formError}
            submitting={status === "loading"}
          />

          {status === "loading" && (
            <p className="status-message">Fetching live weather and destination photos…</p>
          )}
          {status === "error" && (
            <p className="status-message status-error">
              Something went wrong building your packing list. Please try again.
            </p>
          )}

          {result && status === "ready" && (
            <section className="results">
              <TravelPass
                days={result.days}
                locationLabel={result.locationLabel}
                weather={result.weather}
                images={result.images}
                fallbackPalette={result.fallbackPalette}
              />
              <PackingList categories={result.packingList} />
            </section>
          )}
        </main>
      </div>
    </>
  );
}
