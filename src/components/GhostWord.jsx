// A large, low-opacity repeated wordmark behind a section heading. Purely
// decorative — its parent must be position:relative with overflow:hidden.
export default function GhostWord({ word }) {
  return (
    <span className="ghost-word" aria-hidden="true">
      {word} {word} {word}
    </span>
  );
}
