import GhostWord from "./GhostWord";

export default function WeatherSummary({ weather }) {
  return (
    <div className="weather-panel">
      <div className="section-head">
        <GhostWord word="WEATHER" />
        <div className="section-head-rule">
          <span className="eyebrow">
            <span className="asterisk">* </span>Weather
          </span>
        </div>
      </div>
      <div className="weather-grid">
        <div className="weather-field">
          <span className="field-label">Day</span>
          <span className="field-value">{weather.highRange}</span>
        </div>
        <div className="weather-field">
          <span className="field-label">Night</span>
          <span className="field-value">{weather.lowRange}</span>
        </div>
        <div className="weather-field">
          <span className="field-label">Sky</span>
          <span className="field-value field-value-sm">{weather.condition}</span>
        </div>
        <div className="weather-field">
          <span className="field-label">Rain</span>
          <span className="field-value field-value-sm">{weather.rain}</span>
        </div>
      </div>
      <p className="weather-notes">{weather.notes}</p>
      {weather.source === "fallback-estimate" && (
        <p className="estimate-flag">Live weather data was unavailable — this is a rough seasonal guess.</p>
      )}
    </div>
  );
}
