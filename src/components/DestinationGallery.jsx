import DestinationImageCard from "./DestinationImageCard";

export default function DestinationGallery({ images, fallbackPalette }) {
  if (!images || images.length === 0) {
    return (
      <div className="palette-panel">
        <span className="eyebrow">Palette</span>
        <p className="palette-empty-note">
          No destination photos found — here's a palette estimated from the place name instead.
        </p>
        <div className="swatch-strip">
          {(fallbackPalette || []).map((hex) => (
            <div className="swatch-bar" key={hex} style={{ backgroundColor: hex }} title={hex} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="palette-panel">
      <span className="eyebrow">Palette</span>
      <div className="specimen-row">
        {images.map((image, i) => (
          <DestinationImageCard key={image.thumbUrl} image={image} index={i + 1} />
        ))}
      </div>
    </div>
  );
}
