"use client";

/**
 * 食材選択パネルコンポーネント
 * カテゴリごとに食材をトグルスイッチで管理する
 */

import { INGREDIENTS, CATEGORY_LABELS, Ingredient } from "@/lib/ingredients";

interface Props {
  enabledIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: (category: Ingredient["category"]) => void;
  onDeselectAll: (category: Ingredient["category"]) => void;
}

const CATEGORIES: Ingredient["category"][] = [
  "meat",
  "vegetable",
  "topping",
  "extra",
];

export default function IngredientPanel({
  enabledIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: Props) {
  return (
    <div className="ingredient-panel">
      <h3 className="ingredient-panel-title">
        <span>🥘</span> 食材を選ぶ
      </h3>
      <p className="ingredient-panel-desc">
        ONにした食材がランダムな量でカレーに入ります！
      </p>

      {CATEGORIES.map((cat) => {
        const catIngredients = INGREDIENTS.filter((i) => i.category === cat);
        const enabledCount = catIngredients.filter((i) =>
          enabledIds.has(i.id)
        ).length;

        return (
          <div key={cat} className="ingredient-category">
            <div className="ingredient-category-header">
              <h4 className="ingredient-category-title">
                {CATEGORY_LABELS[cat]}
                <span className="ingredient-count">
                  {enabledCount}/{catIngredients.length}
                </span>
              </h4>
              <div className="ingredient-category-actions">
                <button
                  className="btn-all"
                  onClick={() => onSelectAll(cat)}
                  title="全選択"
                >
                  全ON
                </button>
                <button
                  className="btn-none"
                  onClick={() => onDeselectAll(cat)}
                  title="全解除"
                >
                  全OFF
                </button>
              </div>
            </div>

            <div className="ingredient-grid">
              {catIngredients.map((ingredient) => {
                const enabled = enabledIds.has(ingredient.id);
                return (
                  <button
                    key={ingredient.id}
                    className={`ingredient-chip ${enabled ? "enabled" : ""}`}
                    onClick={() => onToggle(ingredient.id)}
                    title={`最大 ${ingredient.maxAmount}${ingredient.unit}`}
                  >
                    <span
                      className="ingredient-dot"
                      style={{ backgroundColor: ingredient.color }}
                    />
                    <span className="ingredient-name">{ingredient.name}</span>
                    <span className={`ingredient-toggle ${enabled ? "on" : "off"}`}>
                      {enabled ? "ON" : "OFF"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
