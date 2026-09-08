import WeatherSummary from "./WeatherSummary";
import DestinationGallery from "./DestinationGallery";
import GhostWord from "./GhostWord";

export default function TravelPass({ days, locationLabel, weather, images, fallbackPalette }) {
  const hero = images && images[0];

  return (
    <div className="pass-card">
      <div className="pass-meta">
        <div className="section-head">
          <GhostWord word="PACK" />
          <div className="section-head-rule">
            <span className="eyebrow">
              <span className="asterisk">* </span>Your packing pass
            </span>
          </div>
          <h2 className="pass-destination">{locationLabel}</h2>
        </div>
        <div className="pass-tag">
          <span className="pass-tag-loop" />
          <span className="pass-tag-hole" />
          <span className="pass-tag-value">{days}</span>
          <span className="pass-tag-unit">days</span>
        </div>
      </div>

      {hero && (
        <div className="pass-hero">
          <img src={hero.thumbUrl} alt={hero.title} />
          <div className="pass-hero-scrim" aria-hidden="true" />
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
