// A small cat that occasionally dashes along the bottom of the page.
// Purely decorative: hidden from assistive tech, and frozen out of view
// entirely when the viewer prefers reduced motion (handled in CSS).
export default function RunningCat() {
  return (
    <div className="running-cat" aria-hidden="true">
      <svg viewBox="0 0 56 30" className="running-cat-svg" fill="var(--ink)">
        {/* tail, curling up and back */}
        <path d="M6 16 C0 14 -1 6 5 4 C2 8 3 13 8 15Z" />
        {/* legs, mid-stride */}
        <rect x="14" y="21" width="3" height="8" rx="1.5" transform="rotate(-18 14 21)" />
        <rect x="22" y="21" width="3" height="8" rx="1.5" transform="rotate(14 22 21)" />
        <rect x="32" y="21" width="3" height="8" rx="1.5" transform="rotate(-14 32 21)" />
        <rect x="40" y="21" width="3" height="8" rx="1.5" transform="rotate(20 40 21)" />
        {/* body */}
        <ellipse cx="28" cy="17" rx="18" ry="7" />
        {/* head */}
        <circle cx="46" cy="11" r="6.5" />
        {/* ears */}
        <path d="M41.5 7 L43 1 L46 6.5Z" />
        <path d="M48 6 L49.5 0.5 L51.5 6.5Z" />
        <circle cx="49" cy="10.5" r="0.9" fill="var(--cream)" />
      </svg>
    </div>
  );
}
