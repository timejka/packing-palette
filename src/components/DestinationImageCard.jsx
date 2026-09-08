import { useImagePalette } from "../hooks/useImagePalette";
import { nameForColor } from "../lib/colorNaming";

export default function DestinationImageCard({ image, index }) {
  const hasPrecomputedPalette = Array.isArray(image.palette) && image.palette.length > 0;
  // getDestinationImages already extracts each picked image's palette while
  // choosing color-distinct photos — reuse it instead of loading and
  // re-analyzing the same image a second time here. The hook is still
  // called unconditionally (rules of hooks); passing it `null` just makes
  // it a no-op when we already have what we need.
  const extracted = useImagePalette(hasPrecomputedPalette ? null : image.thumbUrl, 4);
  const status = hasPrecomputedPalette ? "ready" : extracted.status;
  const palette = hasPrecomputedPalette ? image.palette : extracted.palette;

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
          {palette.map((hex, i) => (
            <div className="paint-chip" key={i}>
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
