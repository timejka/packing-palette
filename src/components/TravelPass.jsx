import WeatherSummary from "./WeatherSummary";
import DestinationGallery from "./DestinationGallery";
import { useImagePalette } from "../hooks/useImagePalette";

export default function TravelPass({ days, locationLabel, weather, images, fallbackPalette }) {
  const hero = images && images[0];
  const { palette: heroPalette, status: heroPaletteStatus } = useImagePalette(hero?.thumbUrl, 4);

  const accentPalette =
    heroPaletteStatus === "ready" && heroPalette.length === 4
      ? heroPalette
      : !hero && fallbackPalette?.length === 4
        ? fallbackPalette
        : null;

  const accentStyle = accentPalette
    ? {
        "--accent-1": accentPalette[0],
        "--accent-2": accentPalette[1],
        "--accent-3": accentPalette[2],
        "--accent-4": accentPalette[3],
      }
    : undefined;

  return (
    <div className="pass-card" style={accentStyle}>
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
          <div className="pass-hero-tint" aria-hidden="true" />
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
