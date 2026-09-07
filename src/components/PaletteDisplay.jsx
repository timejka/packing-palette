export default function PaletteDisplay({ palette }) {
  return (
    <div className="card palette-card">
      <h2>Destination palette</h2>
      <p className="palette-subtitle">Colors inspired by your destination — handy for choosing clothes that fit in.</p>
      <div className="swatches">
        {palette.map((color) => (
          <div className="swatch" key={color.hex}>
            <div className="swatch-color" style={{ backgroundColor: color.hex }} />
            <span className="swatch-name">{color.name}</span>
            <span className="swatch-hex">{color.hex}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
