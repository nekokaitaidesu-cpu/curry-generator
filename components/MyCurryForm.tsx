"use client";

/**
 * マイカレー作成フォーム
 * ユーザーが具体的な量を指定してカレーを作る
 */

import { useState, useCallback } from "react";
import { INGREDIENTS, CATEGORY_LABELS, Ingredient } from "@/lib/ingredients";

interface MyCurryFormProps {
  onSubmit: (
    riceGrams: number,
    rouGrams: number,
    ingredients: { id: string; amount: number }[]
  ) => void;
  isSubmitting: boolean;
}

export default function MyCurryForm({ onSubmit, isSubmitting }: MyCurryFormProps) {
  const [riceGrams, setRiceGrams] = useState("200");
  const [rouGrams, setRouGrams] = useState("150");
  // 選択済み食材: id → 量（文字列）
  const [selectedIngredients, setSelectedIngredients] = useState<Map<string, string>>(
    new Map()
  );

  const handleToggleIngredient = useCallback((ingredient: Ingredient) => {
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      if (next.has(ingredient.id)) {
        next.delete(ingredient.id);
      } else {
        const defaultAmount =
          ingredient.unit === "g"
            ? String(Math.round(ingredient.maxAmount / 3))
            : "1";
        next.set(ingredient.id, defaultAmount);
      }
      return next;
    });
  }, []);

  const handleAmountChange = useCallback((id: string, value: string) => {
    setSelectedIngredients((prev) => {
      const next = new Map(prev);
      next.set(id, value);
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    setSelectedIngredients(new Map());
    setRiceGrams("200");
    setRouGrams("150");
  }, []);

  const handleSubmit = () => {
    const rice = Math.max(1, Math.min(999, parseInt(riceGrams) || 0));
    const rou = Math.max(1, parseInt(rouGrams) || 0);
    const ingredients = Array.from(selectedIngredients.entries())
      .map(([id, amountStr]) => ({
        id,
        amount: Math.max(0, parseFloat(amountStr) || 0),
      }))
      .filter(({ amount }) => amount > 0);
    onSubmit(rice, rou, ingredients);
  };

  const categories: Ingredient["category"][] = [
    "meat",
    "vegetable",
    "topping",
    "extra",
  ];

  return (
    <div className="mycurry-form">
      {/* ご飯とカレールーの量 */}
      <div className="mycurry-base-section">
        <h3 className="section-title">🍚 ご飯とカレーの量</h3>
        <p className="mycurry-desc">ご飯は最大999g。比率は自動で計算されます。</p>
        <div className="mycurry-base-row">
          <div className="mycurry-input-group">
            <label>🍚 ご飯</label>
            <div className="mycurry-input-wrapper">
              <input
                type="number"
                min="1"
                max="999"
                value={riceGrams}
                onChange={(e) => setRiceGrams(e.target.value)}
                className="mycurry-number-input"
                placeholder="200"
              />
              <span className="mycurry-unit">g</span>
            </div>
          </div>
          <div className="mycurry-divider">:</div>
          <div className="mycurry-input-group">
            <label>🍛 カレールー</label>
            <div className="mycurry-input-wrapper">
              <input
                type="number"
                min="1"
                value={rouGrams}
                onChange={(e) => setRouGrams(e.target.value)}
                className="mycurry-number-input"
                placeholder="150"
              />
              <span className="mycurry-unit">g</span>
            </div>
          </div>
        </div>
      </div>

      {/* 食材を選ぶ */}
      <div className="mycurry-ingredients-section">
        <div className="mycurry-ingredients-header">
          <h3 className="section-title" style={{ margin: 0 }}>
            🥘 食材を選ぶ
          </h3>
          {selectedIngredients.size > 0 && (
            <span className="mycurry-selected-badge">
              {selectedIngredients.size}個選択中
            </span>
          )}
        </div>
        <p className="mycurry-desc" style={{ marginTop: 6 }}>
          食材をタップして追加・削除できます
        </p>

        {categories.map((category) => {
          const items = INGREDIENTS.filter((i) => i.category === category);
          return (
            <div key={category} className="mycurry-category">
              <div className="ingredient-category-title" style={{ marginBottom: 8 }}>
                {CATEGORY_LABELS[category]}
              </div>
              <div className="ingredient-grid">
                {items.map((ingredient) => {
                  const isSelected = selectedIngredients.has(ingredient.id);
                  return (
                    <button
                      key={ingredient.id}
                      className={`ingredient-chip ${isSelected ? "enabled" : ""}`}
                      onClick={() => handleToggleIngredient(ingredient)}
                    >
                      <span
                        className="ingredient-dot"
                        style={{ backgroundColor: ingredient.color }}
                      />
                      <span className="ingredient-name">{ingredient.name}</span>
                      <span className={`ingredient-toggle ${isSelected ? "on" : "off"}`}>
                        {isSelected ? "ON" : "OFF"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 選択済み食材の量入力 */}
      {selectedIngredients.size > 0 && (
        <div className="mycurry-amounts-section">
          <h3 className="section-title">📏 各食材の量を入力</h3>
          <div className="mycurry-amounts-list">
            {Array.from(selectedIngredients.entries()).map(([id, amount]) => {
              const ingredient = INGREDIENTS.find((i) => i.id === id)!;
              return (
                <div key={id} className="mycurry-amount-row">
                  <div className="mycurry-amount-label">
                    <span
                      className="ingredient-result-dot"
                      style={{ backgroundColor: ingredient.color }}
                    />
                    <span>{ingredient.name}</span>
                  </div>
                  <div className="mycurry-input-wrapper">
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => handleAmountChange(id, e.target.value)}
                      className="mycurry-number-input mycurry-number-input-sm"
                    />
                    <span className="mycurry-unit">{ingredient.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ボタン類 */}
      <div className="mycurry-actions">
        <button className="mycurry-clear-button" onClick={handleClear}>
          🗑️ リセット
        </button>
        <button
          className={`cook-button ${isSubmitting ? "cooking" : ""}`}
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{ fontSize: 18, padding: "16px 36px" }}
        >
          {isSubmitting ? (
            <span className="cooking-text">
              <span className="cooking-emoji">🌀</span> 調理中...
            </span>
          ) : (
            <span>🍳 このカレーを作る！</span>
          )}
        </button>
      </div>
    </div>
  );
}
