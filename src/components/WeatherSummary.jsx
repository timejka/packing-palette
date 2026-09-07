export default function WeatherSummary({ weather }) {
  return (
    <div className="card weather-card">
      <h2>Weather summary</h2>
      <p className="weather-label">{weather.label}</p>
      <div className="weather-stats">
        <div>
          <span className="stat-value">{weather.highRange}</span>
          <span className="stat-label">Daytime high</span>
        </div>
        <div>
          <span className="stat-value">{weather.lowRange}</span>
          <span className="stat-label">Overnight low</span>
        </div>
      </div>
      <p><strong>Conditions:</strong> {weather.condition}</p>
      <p><strong>Rain:</strong> {weather.rain}</p>
      <p className="weather-notes">{weather.notes}</p>
      {weather.isEstimate && (
        <p className="estimate-flag">Estimated from seasonal patterns — no curated data for this destination yet.</p>
      )}
    </div>
  );
}
