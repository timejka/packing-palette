import DestinationImageCard from "./DestinationImageCard";
import GhostWord from "./GhostWord";
import { nameForColor } from "../lib/colorNaming";

export default function DestinationGallery({ images, fallbackPalette }) {
  if (!images || images.length === 0) {
    return (
      <div className="palette-panel">
        <div className="section-head">
          <GhostWord word="PALETTE" />
          <div className="section-head-rule">
            <span className="eyebrow">
              <span className="asterisk">* </span>Palette
            </span>
          </div>
        </div>
        <p className="palette-empty-note">
          No destination photos found — here's a palette estimated from the place name instead.
        </p>
        <div className="paint-chip-row">
          {(fallbackPalette || []).map((hex, i) => (
            <div className="paint-chip" key={i}>
              <div className="paint-chip-color" style={{ backgroundColor: hex }} />
              <div className="paint-chip-label">
                <span className="paint-chip-name">{nameForColor(hex)}</span>
                <span className="paint-chip-hex">{hex}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="palette-panel">
      <div className="section-head">
        <GhostWord word="PALETTE" />
        <span className="eyebrow">
          <span className="asterisk">* </span>Palette
        </span>
      </div>
      <div className="specimen-row">
        {images.map((image, i) => (
          <DestinationImageCard key={image.thumbUrl} image={image} index={i + 1} />
        ))}
      </div>
    </div>
  );
}
