import DestinationImageCard from "./DestinationImageCard";

export default function DestinationGallery({ images, fallbackPalette }) {
  if (!images || images.length === 0) {
    return (
      <div className="card gallery-card">
        <h2>Destination palette</h2>
        <p className="gallery-subtitle">
          No destination photos found — here's a palette estimated from the place name instead.
        </p>
        <div className="swatches">
          {(fallbackPalette || []).map((hex) => (
            <div className="swatch" key={hex}>
              <div className="swatch-color" style={{ backgroundColor: hex }} />
              <span className="swatch-hex">{hex}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card gallery-card">
      <h2>Destination palette</h2>
      <p className="gallery-subtitle">Colors pulled straight from real photos of your destination.</p>
      <div className="gallery-grid">
        {images.map((image) => (
          <DestinationImageCard key={image.thumbUrl} image={image} />
        ))}
      </div>
    </div>
  );
}
