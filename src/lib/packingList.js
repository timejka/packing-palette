// Builds a categorized packing list with quantities based on trip length,
// the weather summary, and any selected activities.

export const ACTIVITY_OPTIONS = [
  { id: "beach", label: "Beach" },
  { id: "pool", label: "Pool & resort" },
  { id: "city", label: "City sightseeing" },
  { id: "daytrip", label: "Day trip" },
  { id: "leisure", label: "Leisure" },
  { id: "outdoors", label: "Outdoors" },
  { id: "spa", label: "Spa & wellness" },
  { id: "nightlife", label: "Nightlife" },
  { id: "event", label: "Elegant event" },
  { id: "workout", label: "Workout" },
];

function launderEvery(days) {
  // Assume laundry access on longer trips so quantities don't scale forever.
  return days > 10 ? 7 : days;
}

export function generatePackingList({ days, weather, activities = [] }) {
  const cycle = launderEvery(days);
  const cold = weather.lowMin < 10;
  const hot = weather.highMax > 27;
  const chilly = weather.lowMin < 16;

  const categories = [];

  // Clothing — scales with trip length (capped by assumed laundry cycle)
  const clothing = [
    { item: "T-shirts / short-sleeve tops", qty: Math.min(cycle, days) },
    { item: "Underwear", qty: days + 1 },
    { item: "Socks (pairs)", qty: days + 1 },
    { item: "Trousers / trekking pants", qty: Math.max(2, Math.ceil(cycle / 3)) },
  ];
  if (chilly) {
    clothing.push({ item: "Long-sleeve shirts", qty: Math.max(2, Math.ceil(cycle / 2)) });
    clothing.push({ item: "Fleece or warm mid-layer", qty: 2 });
  }
  if (cold) {
    clothing.push({ item: "Warm jacket", qty: 1 });
    clothing.push({ item: "Beanie / warm hat", qty: 1 });
    clothing.push({ item: "Gloves", qty: 1 });
    clothing.push({ item: "Thermal base layers", qty: 2 });
  }
  if (hot) {
    clothing.push({ item: "Wide-brim sun hat", qty: 1 });
    clothing.push({ item: "Shorts", qty: Math.max(2, Math.ceil(cycle / 3)) });
  }
  if (weather.rainy) {
    clothing.push({ item: "Rain jacket", qty: 1 });
  }
  clothing.push({ item: "Comfortable walking shoes", qty: 1 });
  clothing.push({ item: "Sleepwear", qty: Math.max(1, Math.ceil(days / 4)) });
  categories.push({ name: "Clothing", items: clothing });

  // Health & toiletries — flat items, not day-scaled beyond basics
  const health = [
    { item: "Toothbrush & toothpaste", qty: 1 },
    { item: "Sunscreen (SPF 30+)", qty: 1 },
    { item: "Insect repellent", qty: 1 },
    { item: "Basic first-aid kit", qty: 1 },
    { item: "Personal medication", qty: days },
    { item: "Reusable water bottle", qty: 1 },
  ];
  categories.push({ name: "Health & toiletries", items: health });

  // Electronics & documents
  const electronics = [
    { item: "Phone charger", qty: 1 },
    { item: "Universal power adapter", qty: 1 },
    { item: "Power bank", qty: 1 },
    { item: "Passport & travel documents", qty: 1 },
    { item: "Travel insurance details", qty: 1 },
  ];
  categories.push({ name: "Electronics & documents", items: electronics });

  // Activity-specific gear. A few water-based activities share the base
  // "Swimsuit" reminder, but every activity also contributes at least one
  // item found nowhere else in the list.
  const activityItems = [];
  if (activities.includes("beach")) {
    activityItems.push(
      { item: "Swimsuit", qty: 2 },
      { item: "Beach towel (quick-dry, sand-resistant)", qty: 1 },
      { item: "Flip-flops", qty: 1 },
    );
  }
  if (activities.includes("pool")) {
    activityItems.push(
      { item: "Swimsuit", qty: 2 },
      { item: "Swim cover-up / kaftan", qty: 1 },
      { item: "Pool slides", qty: 1 },
    );
  }
  if (activities.includes("city")) {
    activityItems.push(
      { item: "Anti-theft crossbody bag", qty: 1 },
      { item: "Offline maps or printed transit passes", qty: 1 },
    );
  }
  if (activities.includes("daytrip")) {
    activityItems.push(
      { item: "Packable foldable tote bag", qty: 1 },
      { item: "Reusable snack container", qty: 1 },
      { item: "Printed tickets & reservations folder", qty: 1 },
    );
  }
  if (activities.includes("leisure")) {
    activityItems.push(
      { item: "Paperback book or e-reader", qty: 1 },
      { item: "Comfortable loungewear", qty: 2 },
      { item: "Travel pillow", qty: 1 },
    );
  }
  if (activities.includes("outdoors")) {
    activityItems.push(
      { item: "Multi-tool / pocket knife", qty: 1 },
      { item: "Lightweight daypack", qty: 1 },
      { item: "Compact rain poncho", qty: 1 },
    );
  }
  if (activities.includes("spa")) {
    activityItems.push(
      { item: "Swimsuit", qty: 2 },
      { item: "Lightweight robe or wrap", qty: 1 },
      { item: "Reusable makeup remover pads", qty: 1 },
    );
  }
  if (activities.includes("nightlife")) {
    activityItems.push(
      { item: "Going-out outfit", qty: Math.max(1, Math.ceil(days / 4)) },
      { item: "Statement accessories (jewelry/clutch)", qty: 1 },
      { item: "Blister plasters (for heels/dancing)", qty: 1 },
    );
  }
  if (activities.includes("event")) {
    activityItems.push(
      { item: "Formal outfit (suit or gown)", qty: Math.max(1, Math.ceil(days / 5)) },
      { item: "Dress shoes", qty: 1 },
      { item: "Small clutch or evening bag", qty: 1 },
    );
  }
  if (activities.includes("workout")) {
    activityItems.push(
      { item: "Workout / athletic wear", qty: Math.max(2, Math.ceil(days / 3)) },
      { item: "Running shoes", qty: 1 },
      { item: "Reusable gym towel", qty: 1 },
    );
  }
  if (activityItems.length > 0) {
    // A few activities (beach/pool/spa) share reminders like "Swimsuit" —
    // dedupe by item name so selecting more than one doesn't repeat a row.
    const seen = new Set();
    const dedupedItems = activityItems.filter(({ item }) => {
      if (seen.has(item)) return false;
      seen.add(item);
      return true;
    });
    categories.push({ name: "Activity gear", items: dedupedItems });
  }

  return categories;
}
