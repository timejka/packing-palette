import { useImagePalette } from "../hooks/useImagePalette";
import { nameForColor } from "../lib/colorNaming";

export default function DestinationImageCard({ image, index }) {
  const { status, palette } = useImagePalette(image.thumbUrl, 4);

  return (
    <figure className="specimen">
      <span className="specimen-index">{String(index).padStart(2, "0")}</span>
      <img className="specimen-thumb" src={image.thumbUrl} alt={image.title} loading="lazy" />
      <figcaption>
        <a href={image.descriptionUrl} target="_blank" rel="noopener noreferrer">
          {image.title}
        </a>
      </figcaption>
      {status === "loading" && <p className="specimen-status">extracting colors…</p>}
      {status === "error" && <p className="specimen-status">no colors extracted</p>}
      {status === "ready" && (
        <div className="paint-chip-row">
          {palette.map((hex) => (
            <div className="paint-chip" key={hex}>
              <div className="paint-chip-color" style={{ backgroundColor: hex }} />
              <div className="paint-chip-label">
                <span className="paint-chip-name">{nameForColor(hex)}</span>
                <span className="paint-chip-hex">{hex}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </figure>
  );
}
