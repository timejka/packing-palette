// A barely-there scatter of pale-yellow sparkles across the page background.
// Positions are randomized once at module load, not on every render.

const STAR_COUNT = 46;

function makeStars(count) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 6 + Math.random() * 15,
      opacity: 0.08 + Math.random() * 0.22,
      rotation: Math.random() * 70 - 35,
    });
  }
  return stars;
}

const STARS = makeStars(STAR_COUNT);

export default function StarField() {
  return (
    <div className="star-field" aria-hidden="true">
      {STARS.map((s) => (
        <svg
          key={s.id}
          className="star"
          viewBox="0 0 24 24"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            transform: `rotate(${s.rotation}deg)`,
          }}
        >
          <path d="M12 0C12 6 6 12 0 12C6 12 12 18 12 24C12 18 18 12 24 12C18 12 12 6 12 0Z" />
        </svg>
      ))}
    </div>
  );
}
