import { useState } from "react";
import TripForm from "./components/TripForm";
import WeatherSummary from "./components/WeatherSummary";
import PaletteDisplay from "./components/PaletteDisplay";
import PackingList from "./components/PackingList";
import { getWeatherSummary } from "./lib/weather";
import { getDestinationPalette } from "./lib/palette";
import { generatePackingList } from "./lib/packingList";
import "./App.css";

const DEFAULT_TRIP = {
  location: "Kruger National Park, South Africa",
  startDate: "2026-07-16",
  endDate: "2026-07-31",
  activities: ["safari"],
};

function daysBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

export default function App() {
  const [trip, setTrip] = useState(DEFAULT_TRIP);
  const [result, setResult] = useState(() => buildResult(DEFAULT_TRIP));

  function buildResult(t) {
    const weather = getWeatherSummary(t.location, t.startDate, t.endDate);
    const palette = getDestinationPalette(t.location);
    const days = daysBetween(t.startDate, t.endDate);
    const packingList = generatePackingList({ days, weather, activities: t.activities });
    return { weather, palette, packingList, days };
  }

  const handleSubmit = () => {
    setResult(buildResult(trip));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Packing Palette</h1>
        <p>Tell us where and when you're headed — we'll sort out the weather, the vibe, and what to pack.</p>
      </header>

      <main className="app-main">
        <TripForm trip={trip} onChange={setTrip} onSubmit={handleSubmit} />

        {result && (
          <section className="results">
            <p className="trip-length">{result.days}-day trip to {trip.location || "your destination"}</p>
            <div className="results-grid">
              <WeatherSummary weather={result.weather} />
              <PaletteDisplay palette={result.palette} />
            </div>
            <PackingList categories={result.packingList} />
          </section>
        )}
      </main>
    </div>
  );
}
