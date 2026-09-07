import { ACTIVITY_OPTIONS } from "../lib/packingList";

export default function TripForm({ trip, onChange, onSubmit }) {
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
      <div className="field">
        <label htmlFor="location">Where are you going?</label>
        <input
          id="location"
          type="text"
          placeholder="e.g. Kruger National Park, South Africa"
          value={trip.location}
          onChange={(e) => onChange({ ...trip, location: e.target.value })}
          required
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="startDate">Start date</label>
          <input
            id="startDate"
            type="date"
            value={trip.startDate}
            onChange={(e) => onChange({ ...trip, startDate: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="endDate">End date</label>
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
        <label>Activities (optional)</label>
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

      <button type="submit" className="submit-btn">
        Build my packing list
      </button>
    </form>
  );
}
