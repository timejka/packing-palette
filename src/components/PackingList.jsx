import { useState } from "react";

export default function PackingList({ categories }) {
  const [checked, setChecked] = useState({});

  const toggle = (key) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="card packing-card">
      <div className="packing-header">
        <h2>Packing list</h2>
        <span className="packing-progress">{checkedCount} / {totalItems} packed</span>
      </div>
      {categories.map((category) => (
        <div className="packing-category" key={category.name}>
          <h3>{category.name}</h3>
          <ul>
            {category.items.map((item) => {
              const key = `${category.name}-${item.item}`;
              return (
                <li key={key}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!checked[key]}
                      onChange={() => toggle(key)}
                    />
                    <span className={checked[key] ? "item-checked" : ""}>
                      {item.item}
                    </span>
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
