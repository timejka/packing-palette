// A slightly imperfect, hand-drawn-style checkmark for the packing list.
export default function HandCheckIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.5 12.8C5.8 14.6 7.6 16.4 9.3 18.4C12.4 13.6 15.8 8.9 20.5 5.2"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
