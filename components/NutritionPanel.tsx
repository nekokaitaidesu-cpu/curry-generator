"use client";

/**
 * 栄養情報パネルコンポーネント
 * 生成されたカレーの栄養情報をきれいに表示する
 */

import { NutritionInfo } from "@/lib/curry-generator";

interface Props {
  nutrition: NutritionInfo;
}

interface NutritionRow {
  label: string;
  value: number;
  unit: string;
  color: string;
  maxValue: number; // バー表示用の最大値
}

export default function NutritionPanel({ nutrition }: Props) {
  const rows: NutritionRow[] = [
    {
      label: "カロリー",
      value: nutrition.kcal,
      unit: "kcal",
      color: "#FF6B35",
      maxValue: 3000,
    },
    {
      label: "タンパク質",
      value: nutrition.protein,
      unit: "g",
      color: "#4ECDC4",
      maxValue: 100,
    },
    {
      label: "脂質",
      value: nutrition.fat,
      unit: "g",
      color: "#FFE66D",
      maxValue: 150,
    },
    {
      label: "炭水化物",
      value: nutrition.carbs,
      unit: "g",
      color: "#95E1D3",
      maxValue: 400,
    },
    {
      label: "ナトリウム",
      value: nutrition.sodium,
      unit: "mg",
      color: "#F38181",
      maxValue: 5000,
    },
    {
      label: "食物繊維",
      value: nutrition.fiber,
      unit: "g",
      color: "#A8E6CF",
      maxValue: 50,
    },
  ];

  return (
    <div className="nutrition-panel">
      <h3 className="nutrition-title">
        <span className="nutrition-icon">📊</span> 栄養情報
      </h3>

      {/* カロリー大表示 */}
      <div className="calorie-display">
        <span className="calorie-value">{nutrition.kcal.toLocaleString()}</span>
        <span className="calorie-unit">kcal</span>
      </div>

      {/* 栄養バー */}
      <div className="nutrition-rows">
        {rows.slice(1).map((row) => (
          <div key={row.label} className="nutrition-row">
            <div className="nutrition-row-header">
              <span className="nutrition-label">{row.label}</span>
              <span className="nutrition-value">
                {row.value}
                <span className="nutrition-unit">{row.unit}</span>
              </span>
            </div>
            <div className="nutrition-bar-bg">
              <div
                className="nutrition-bar"
                style={{
                  width: `${Math.min((row.value / row.maxValue) * 100, 100)}%`,
                  backgroundColor: row.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="nutrition-note">※ 栄養値は概算です</p>
    </div>
  );
}
