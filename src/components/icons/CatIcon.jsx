// A minimal cat-face silhouette used as a small decorative mark.
export default function CatIcon({ className, size = 20 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 8 7 1.5 9.6 8.5Z" />
      <path d="M21 8 17 1.5 14.4 8.5Z" />
      <circle cx="12" cy="14.5" r="8.5" />
    </svg>
  );
}
