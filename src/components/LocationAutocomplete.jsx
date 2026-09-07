import { useEffect, useRef, useState } from "react";
import { searchLocations } from "../lib/geocoding";

export default function LocationAutocomplete({ value, onSelect, id = "location" }) {
  const [query, setQuery] = useState(value?.label || "");
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setQuery(value?.label || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  function handleChange(e) {
    const text = e.target.value;
    setQuery(text);
    setError(null);
    if (value) onSelect(null);
    setOpen(true);
    setHighlighted(-1);

    clearTimeout(debounceRef.current);
    if (text.trim().length < 2) {
      setOptions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchLocations(text);
        setOptions(results);
      } catch {
        setError("Couldn't search locations right now.");
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function selectOption(option) {
    onSelect(option);
    setQuery(option.label);
    setOptions([]);
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (!open || options.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      if (highlighted >= 0) {
        e.preventDefault();
        selectOption(options[highlighted]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="autocomplete" ref={containerRef}>
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="e.g. Cape Town, South Africa"
        value={query}
        onChange={handleChange}
        onFocus={() => options.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        required
      />
      {value && (
        <span className="autocomplete-check" title="Location confirmed">
          ✓
        </span>
      )}
      {open && (loading || options.length > 0 || error) && (
        <ul className="autocomplete-list">
          {loading && <li className="autocomplete-status">Searching…</li>}
          {!loading && error && <li className="autocomplete-status">{error}</li>}
          {!loading &&
            options.map((opt, i) => (
              <li
                key={opt.id}
                className={i === highlighted ? "autocomplete-option active" : "autocomplete-option"}
                onMouseDown={() => selectOption(opt)}
                onMouseEnter={() => setHighlighted(i)}
              >
                <span className="option-name">{opt.name}</span>
                <span className="option-detail">{[opt.admin1, opt.country].filter(Boolean).join(", ")}</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
