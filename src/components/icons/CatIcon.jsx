// A minimal cat-face silhouette used as a small decorative mark.
export default function CatIcon({ className, size = 20 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="14.5" r="8.3" fill="currentColor" />
      <path fill="currentColor" d="M3 10 Q1 5 5 1.2 Q8 5 8.5 10 Q6 12.4 3 10Z" />
      <path fill="currentColor" d="M21 10 Q23 5 19 1.2 Q16 5 15.5 10 Q18 12.4 21 10Z" />
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.9">
        <line x1="0.8" y1="14.4" x2="6.8" y2="13.8" />
        <line x1="0.6" y1="17" x2="6.8" y2="16.8" />
        <line x1="17.2" y1="13.8" x2="23.2" y2="14.4" />
        <line x1="17.2" y1="16.8" x2="23.4" y2="17" />
      </g>
    </svg>
  );
}
