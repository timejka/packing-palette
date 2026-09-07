// Builds a categorized packing list with quantities based on trip length,
// the weather summary, and any selected activities.

export const ACTIVITY_OPTIONS = [
  { id: "safari", label: "Safari / wildlife viewing" },
  { id: "hiking", label: "Hiking" },
  { id: "swimming", label: "Swimming / beach" },
  { id: "business", label: "Business / formal" },
  { id: "photography", label: "Photography" },
  { id: "cold", label: "Cold weather / snow" },
  { id: "city", label: "City sightseeing" },
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

  // Activity-specific gear
  const activityItems = [];
  if (activities.includes("safari")) {
    activityItems.push(
      { item: "Binoculars", qty: 1 },
      { item: "Neutral-colored clothing (khaki/olive, avoid bright white, black & blue)", qty: 1 },
      { item: "Zoom lens camera", qty: 1 },
      { item: "Malaria prophylaxis (check destination risk)", qty: 1 },
    );
  }
  if (activities.includes("hiking")) {
    activityItems.push(
      { item: "Hiking boots", qty: 1 },
      { item: "Daypack", qty: 1 },
      { item: "Moisture-wicking hiking socks (pairs)", qty: Math.min(cycle, days) },
    );
  }
  if (activities.includes("swimming")) {
    activityItems.push(
      { item: "Swimsuit", qty: 2 },
      { item: "Quick-dry towel", qty: 1 },
      { item: "Flip-flops / sandals", qty: 1 },
    );
  }
  if (activities.includes("business")) {
    activityItems.push(
      { item: "Formal outfit", qty: Math.max(1, Math.ceil(days / 3)) },
      { item: "Dress shoes", qty: 1 },
    );
  }
  if (activities.includes("photography")) {
    activityItems.push(
      { item: "Extra camera batteries", qty: 2 },
      { item: "Memory cards", qty: 2 },
      { item: "Lens cloth", qty: 1 },
    );
  }
  if (activities.includes("cold")) {
    activityItems.push(
      { item: "Insulated waterproof jacket", qty: 1 },
      { item: "Thermal socks (pairs)", qty: 3 },
      { item: "Hand warmers", qty: 4 },
    );
  }
  if (activities.includes("city")) {
    activityItems.push(
      { item: "Crossbody / anti-theft bag", qty: 1 },
      { item: "Comfortable everyday shoes", qty: 1 },
    );
  }
  if (activityItems.length > 0) {
    categories.push({ name: "Activity gear", items: activityItems });
  }

  return categories;
}
