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
      {status === "loading" && <p className="specimen-status">Extracting colors…</p>}
      {status === "error" && <p className="specimen-status">No colors extracted.</p>}
      {status === "ready" && (
        <>
          <div className="swatch-strip swatch-strip-sm">
            {palette.map((hex) => (
              <div
                className="swatch-bar"
                key={hex}
                style={{ backgroundColor: hex }}
                title={`${nameForColor(hex)} — ${hex}`}
              />
            ))}
          </div>
          <p className="specimen-color-names">{palette.map(nameForColor).join(" · ")}</p>
        </>
      )}
    </figure>
  );
}
