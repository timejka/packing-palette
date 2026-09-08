// A small filled heart, used as the "packed" mark inside a checked box.
export default function HeartIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.3C12 20.3 3.6 15.3 3.6 9.4C3.6 6.5 5.9 4.3 8.7 4.3C10.1 4.3 11.4 5 12 6.1C12.6 5 13.9 4.3 15.3 4.3C18.1 4.3 20.4 6.5 20.4 9.4C20.4 15.3 12 20.3 12 20.3Z"
        fill="currentColor"
      />
    </svg>
  );
}
