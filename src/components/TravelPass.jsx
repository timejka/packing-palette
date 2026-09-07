import WeatherSummary from "./WeatherSummary";
import DestinationGallery from "./DestinationGallery";

export default function TravelPass({ days, locationLabel, weather, images, fallbackPalette }) {
  const hero = images && images[0];

  return (
    <div className="pass-card">
      <div className="pass-meta">
        <div>
          <span className="eyebrow">Your packing pass</span>
          <h2 className="pass-destination">{locationLabel}</h2>
        </div>
        <div className="pass-stamp">
          <span className="pass-stamp-value">{days}</span>
          <span className="pass-stamp-unit">days</span>
        </div>
      </div>

      {hero && (
        <div className="pass-hero">
          <img src={hero.thumbUrl} alt={hero.title} />
          <a className="pass-hero-caption" href={hero.descriptionUrl} target="_blank" rel="noopener noreferrer">
            {hero.title}
          </a>
        </div>
      )}

      <div className="pass-divider" aria-hidden="true">
        <span className="pass-notch pass-notch-left" />
        <span className="pass-notch pass-notch-right" />
      </div>

      <div className="pass-body">
        <WeatherSummary weather={weather} />
        <DestinationGallery images={images} fallbackPalette={fallbackPalette} />
      </div>
    </div>
  );
}
