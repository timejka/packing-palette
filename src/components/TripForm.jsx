import LocationAutocomplete from "./LocationAutocomplete";
import { ACTIVITY_OPTIONS } from "../lib/packingList";

export default function TripForm({ trip, onChange, onSubmit, formError, submitting }) {
  const toggleActivity = (id) => {
    const next = trip.activities.includes(id)
      ? trip.activities.filter((a) => a !== id)
      : [...trip.activities, id];
    onChange({ ...trip, activities: next });
  };

  const dateError =
    trip.startDate && trip.endDate && new Date(trip.endDate) < new Date(trip.startDate);

  return (
    <form
      className="trip-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!dateError) onSubmit();
      }}
    >
      <div className="trip-form-head">
        <span className="eyebrow">Plan a trip</span>
        <h2>Where to, and when?</h2>
      </div>

      <div className="field">
        <label htmlFor="location" className="field-label">
          Destination
        </label>
        <LocationAutocomplete
          id="location"
          value={trip.location}
          onSelect={(location) => onChange({ ...trip, location })}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="startDate" className="field-label">
            Depart
          </label>
          <input
            id="startDate"
            type="date"
            value={trip.startDate}
            onChange={(e) => onChange({ ...trip, startDate: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="endDate" className="field-label">
            Return
          </label>
          <input
            id="endDate"
            type="date"
            value={trip.endDate}
            onChange={(e) => onChange({ ...trip, endDate: e.target.value })}
            required
          />
        </div>
      </div>
      {dateError && <p className="error">End date must be after start date.</p>}

      <div className="field">
        <span className="field-label">
          Activities <span className="field-label-optional">(optional)</span>
        </span>
        <div className="activity-chips">
          {ACTIVITY_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.id}
              className={`chip ${trip.activities.includes(opt.id) ? "chip-active" : ""}`}
              onClick={() => toggleActivity(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {formError && <p className="error">{formError}</p>}

      <div className="trip-form-actions">
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? "Building…" : "Build my packing list"}
        </button>
      </div>
    </form>
  );
}
