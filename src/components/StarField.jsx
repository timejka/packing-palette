// A scatter of bright (but translucent) pink/yellow stars and asterisks
// across the page background only — never over content. Positions are
// randomized once at module load, not on every render.

const MARK_COUNT = 42;

function makeMarks(count) {
  const marks = [];
  for (let i = 0; i < count; i++) {
    marks.push({
      id: i,
      kind: Math.random() < 0.45 ? "asterisk" : "sparkle",
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 10 + Math.random() * 16,
      opacity: 0.35 + Math.random() * 0.25,
      rotation: Math.random() * 70 - 35,
      color: Math.random() < 0.5 ? "var(--star-pink)" : "var(--star-yellow)",
    });
  }
  return marks;
}

const MARKS = makeMarks(MARK_COUNT);

export default function StarField() {
  return (
    <div className="star-field" aria-hidden="true">
      {MARKS.map((m) =>
        m.kind === "asterisk" ? (
          <span
            key={m.id}
            className="star star-asterisk"
            style={{
              left: `${m.x}%`,
              top: `${m.y}%`,
              fontSize: m.size,
              opacity: m.opacity,
              color: m.color,
              transform: `rotate(${m.rotation}deg)`,
            }}
          >
            *
          </span>
        ) : (
          <svg
            key={m.id}
            className="star"
            viewBox="0 0 24 24"
            style={{
              left: `${m.x}%`,
              top: `${m.y}%`,
              width: m.size,
              height: m.size,
              opacity: m.opacity,
              fill: m.color,
              transform: `rotate(${m.rotation}deg)`,
            }}
          >
            <path d="M12 0C12 6 6 12 0 12C6 12 12 18 12 24C12 18 18 12 24 12C18 12 12 6 12 0Z" />
          </svg>
        )
      )}
    </div>
  );
}
