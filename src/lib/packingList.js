// Builds a categorized packing list from a data-driven spec
// (packingListData.json): a base list that's always included, a set of
// "shared" items triggered by any of several activities (deduped so
// selecting more than one trigger doesn't repeat a row), and per-activity
// items that only show up for that one activity.
//
// Quantities are either a fixed number or a named formula resolved below —
// see packingListData.json's own "quantityRules" section for the source
// spec these mirror.

import packingListData from "./packingListData.json" with { type: "json" };

export const ACTIVITY_OPTIONS = Object.entries(packingListData.categories).map(([id, category]) => ({
  id,
  label: category.label,
}));

function anySelected(activities, ids) {
  return ids.some((id) => activities.includes(id));
}

function countSelected(activities, ids) {
  return ids.filter((id) => activities.includes(id)).length;
}

const QUANTITY_RESOLVERS = {
  travelOutfits: ({ days }) => (days <= 3 ? 1 : 2),
  "days + 2": ({ days }) => days + 2,
  days: ({ days }) => days,
  swimsuits: ({ days, activities }) =>
    anySelected(activities, ["beach", "pool_resort", "spa_wellness"]) ? days : 0,
  dayOutfits: ({ days }) => days,
  nightOutfits: ({ nights, activities }) =>
    Math.min(2 + countSelected(activities, ["nightlife", "elegant_event"]), nights),
};

function resolveQty(qty, ctx) {
  if (typeof qty === "number") return qty;
  const resolve = QUANTITY_RESOLVERS[qty];
  if (!resolve) {
    console.warn(`Unknown packing quantity rule "${qty}", defaulting to 1`);
    return 1;
  }
  return resolve(ctx);
}

function buildItems(specItems, ctx) {
  return specItems.map(({ name, qty }) => ({ item: name, qty: resolveQty(qty, ctx) }));
}

const BASE_SECTION_LABELS = {
  clothing: "Clothing",
  beauty: "Beauty",
  practical: "Practical",
};

export function generatePackingList({ days, activities = [] }) {
  const ctx = { days, nights: Math.max(days - 1, 0), activities };
  const categories = [];

  for (const [key, items] of Object.entries(packingListData.base)) {
    categories.push({ name: BASE_SECTION_LABELS[key] || key, items: buildItems(items, ctx) });
  }

  const sharedMatched = packingListData.shared.filter((item) =>
    item.triggers.some((trigger) => activities.includes(trigger))
  );
  if (sharedMatched.length > 0) {
    categories.push({ name: "Activity essentials", items: buildItems(sharedMatched, ctx) });
  }

  for (const activityId of activities) {
    const category = packingListData.categories[activityId];
    if (!category) continue;
    categories.push({ name: category.label, items: buildItems(category.items, ctx) });
  }

  return categories;
}
