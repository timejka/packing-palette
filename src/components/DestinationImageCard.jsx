import { useImagePalette } from "../hooks/useImagePalette";
import { nameForColor } from "../lib/colorNaming";

export default function DestinationImageCard({ image }) {
  const { status, palette } = useImagePalette(image.thumbUrl, 4);

  return (
    <figure className="gallery-item">
      <img src={image.thumbUrl} alt={image.title} loading="lazy" />
      <figcaption>
        <a href={image.descriptionUrl} target="_blank" rel="noopener noreferrer">
          {image.title}
        </a>
        {image.artist && <span className="gallery-attribution"> · {image.artist}</span>}
      </figcaption>
      {status === "loading" && <p className="gallery-status">Extracting colors…</p>}
      {status === "error" && <p className="gallery-status">Couldn't extract colors from this photo.</p>}
      {status === "ready" && (
        <div className="mini-swatches">
          {palette.map((hex) => (
            <div className="mini-swatch" key={hex} title={`${nameForColor(hex)} — ${hex}`}>
              <div className="mini-swatch-color" style={{ backgroundColor: hex }} />
              <span>{nameForColor(hex)}</span>
            </div>
          ))}
        </div>
      )}
    </figure>
  );
}
