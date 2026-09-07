import { useState } from "react";
import PawIcon from "./icons/PawIcon";

export default function PackingList({ categories }) {
  const [checked, setChecked] = useState({});

  const toggle = (key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="packing-card">
      <div className="packing-header">
        <div>
          <span className="eyebrow">Field guide</span>
          <h2>Packing list</h2>
        </div>
        <span className="packing-progress">
          {checkedCount} / {totalItems} packed
        </span>
      </div>
      {categories.map((category, i) => (
        <div className="packing-category" key={category.name}>
          <div className="packing-category-head">
            <span className="specimen-index">{String(i + 1).padStart(2, "0")}</span>
            <h3>{category.name}</h3>
          </div>
          <ul>
            {category.items.map((item) => {
              const key = `${category.name}-${item.item}`;
              return (
                <li key={key}>
                  <label>
                    <span className="checkbox-shell">
                      <input type="checkbox" checked={!!checked[key]} onChange={() => toggle(key)} />
                      <PawIcon className="paw-mark" />
                    </span>
                    <span className={`item-label ${checked[key] ? "item-checked" : ""}`}>{item.item}</span>
                    <span className="item-qty">×{item.qty}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
