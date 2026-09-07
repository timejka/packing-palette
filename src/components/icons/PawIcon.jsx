// A small paw print used as the "packed" mark on checklist items.
export default function PawIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <ellipse cx="12" cy="16.2" rx="6" ry="5.1" />
      <circle cx="5" cy="8.2" r="2.5" />
      <circle cx="10.6" cy="4.4" r="2.5" />
      <circle cx="15.4" cy="4.4" r="2.5" />
      <circle cx="19" cy="8.2" r="2.5" />
    </svg>
  );
}
