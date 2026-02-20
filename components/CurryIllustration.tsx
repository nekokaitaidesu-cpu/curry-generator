"use client";

/**
 * カレーイラストコンポーネント
 * SVGを使ってカレープレートをダイナミックに描画する
 */

import { useMemo } from "react";
import { CurryResult, IngredientResult } from "@/lib/curry-generator";

interface Props {
  result: CurryResult | null;
}

/** 食材アイコンの描画パラメータ */
interface IconParams {
  x: number;
  y: number;
  size: number;
  color: string;
  shape: string;
  label: string;
}

/** ランダムシード付き疑似乱数（再現性のため） */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** カレーエリア内に食材アイコンを配置する */
function placeIngredientIcons(
  ingredients: IngredientResult[],
  curryPercent: number,
  seed: number
): IconParams[] {
  const rand = seededRandom(seed);
  const icons: IconParams[] = [];

  // カレーエリアのSVG座標（プレート中心: 200,200、半径160）
  // カレーは右側に配置（ライス比率に応じて左右分割）
  const plateR = 145;
  const cx = 200;
  const cy = 200;

  // ライス/カレーの境界X座標（プレート内）
  // ricePercent=0 => 全部カレー、ricePercent=100 => 全部ライス
  const splitRatio = curryPercent / 100; // カレーが占める割合

  for (const { ingredient, amount } of ingredients) {
    // 食材の量に応じてアイコン数を決定（最大8個）
    const iconCount = Math.min(Math.ceil(amount / (ingredient.maxAmount / 6)), 8);

    for (let i = 0; i < iconCount; i++) {
      // カレーエリア内にランダム配置
      let x: number, y: number;
      let attempts = 0;
      do {
        // 角度と距離でランダム配置
        const angle = rand() * Math.PI * 2;
        const r = rand() * plateR * 0.85;
        x = cx + r * Math.cos(angle);
        y = cy + r * Math.sin(angle);

        // プレート内に収まっているか確認
        const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (distFromCenter > plateR * 0.9) {
          attempts++;
          continue;
        }

        // カレーエリアかどうか確認
        // プレートを左（ライス）と右（カレー）に分ける
        // splitRatio=1.0 → 全カレー、splitRatio=0.0 → 全ライス
        const normalizedX = (x - (cx - plateR)) / (plateR * 2); // 0〜1
        if (splitRatio > 0.5) {
          // カレーが多い場合: 右寄りに配置
          if (normalizedX < (1 - splitRatio) * 0.8) {
            attempts++;
            continue;
          }
        } else {
          // ライスが多い場合: カレーエリアに限定
          if (normalizedX < (1 - splitRatio)) {
            // まだカレーエリアに収まっている可能性あり
          } else {
            attempts++;
            continue;
          }
        }
        break;
      } while (attempts < 20);

      const size = 8 + rand() * 10;
      icons.push({
        x,
        y,
        size,
        color: ingredient.color,
        shape: ingredient.shape,
        label: ingredient.name,
      });
    }
  }

  return icons;
}

/** 食材アイコンをSVGで描画する */
function IngredientIcon({ icon }: { icon: IconParams }) {
  const { x, y, size, color, shape } = icon;

  switch (shape) {
    case "rect":
      return (
        <rect
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size * 0.7}
          rx={2}
          fill={color}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={0.5}
          opacity={0.9}
        />
      );
    case "oval":
      return (
        <ellipse
          cx={x}
          cy={y}
          rx={size / 2}
          ry={size / 3}
          fill={color}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={0.5}
          opacity={0.9}
        />
      );
    case "triangle":
      return (
        <polygon
          points={`${x},${y - size / 2} ${x - size / 2},${y + size / 2} ${x + size / 2},${y + size / 2}`}
          fill={color}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={0.5}
          opacity={0.9}
        />
      );
    case "star":
      return (
        <polygon
          points={Array.from({ length: 10 }, (_, i) => {
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? size / 2 : size / 4;
            return `${x + r * Math.cos(angle)},${y + r * Math.sin(angle)}`;
          }).join(" ")}
          fill={color}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={0.5}
          opacity={0.9}
        />
      );
    default: // circle
      return (
        <circle
          cx={x}
          cy={y}
          r={size / 2}
          fill={color}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={0.5}
          opacity={0.9}
        />
      );
  }
}

export default function CurryIllustration({ result }: Props) {
  const svgSize = 400;
  const cx = 200;
  const cy = 200;
  const plateR = 160;
  const innerR = 145;

  // 食材アイコンの配置を計算（resultが変わるたびに再計算）
  const icons = useMemo(() => {
    if (!result || result.ingredients.length === 0) return [];
    const seed = result.ricePercent * 1000 + result.ingredients.length * 7;
    return placeIngredientIcons(result.ingredients, result.curryPercent, seed);
  }, [result]);

  if (!result) {
    // 初期状態の皿表示
    return (
      <svg
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        width="100%"
        height="100%"
        style={{ maxWidth: 360, margin: "0 auto", display: "block" }}
      >
        {/* 皿の影 */}
        <ellipse cx={cx} cy={cy + 15} rx={plateR + 5} ry={20} fill="rgba(0,0,0,0.15)" />
        {/* 皿外枠 */}
        <circle cx={cx} cy={cy} r={plateR} fill="#F5F0E8" stroke="#D4C5A9" strokeWidth={8} />
        {/* 皿内側 */}
        <circle cx={cx} cy={cy} r={innerR} fill="#FEFCF8" />
        {/* ？マーク */}
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={80} fill="#D4C5A9">
          🍛
        </text>
        <text x={cx} y={cy + 60} textAnchor="middle" fontSize={14} fill="#A09080">
          「カレーを作る！」を押してね
        </text>
      </svg>
    );
  }

  const { ricePercent, curryPercent } = result;

  // カレーとライスの色定義
  const curryColor = "#C8860A";
  const curryColorDark = "#A06808";
  const riceColor = "#FEFCF8";

  // ライス/カレーの分割（0:100〜100:0）
  // プレートを左右に分割（ライスが左、カレーが右）
  // 正確には円形クリッピングで表現

  // カレーが占める角度（全円=2π）
  // ricePercent=0 → curryPercent=100 → カレーが全面
  // ライス:カレーの境界線（左から右へ）
  const riceWidthRatio = ricePercent / 100;
  const curryWidthRatio = curryPercent / 100;

  // クリッピングパス用の計算
  // ライスエリア: プレート左側（rice%分）
  // カレーエリア: プレート右側（curry%分）
  const splitX = cx - innerR + innerR * 2 * riceWidthRatio;

  return (
    <svg
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      width="100%"
      height="100%"
      style={{ maxWidth: 360, margin: "0 auto", display: "block" }}
    >
      <defs>
        {/* プレートのクリッピング円 */}
        <clipPath id="plateClip">
          <circle cx={cx} cy={cy} r={innerR} />
        </clipPath>
        {/* ライスエリアのクリッピング */}
        <clipPath id="riceClip">
          <rect x={cx - innerR} y={cy - innerR} width={innerR * 2 * riceWidthRatio} height={innerR * 2} />
        </clipPath>
        {/* カレーエリアのクリッピング */}
        <clipPath id="curryClip">
          <rect x={splitX} y={cy - innerR} width={innerR * 2 * curryWidthRatio} height={innerR * 2} />
        </clipPath>

        {/* カレーグラデーション */}
        <radialGradient id="curryGrad" cx="60%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#E09A20" />
          <stop offset="100%" stopColor={curryColorDark} />
        </radialGradient>

        {/* ライスグラデーション */}
        <radialGradient id="riceGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0EDE0" />
        </radialGradient>

        {/* 皿のグラデーション */}
        <radialGradient id="plateGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E8E0D0" />
        </radialGradient>

        {/* 湯気フィルター */}
        <filter id="blur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* 皿の影 */}
      <ellipse cx={cx + 5} cy={cy + 18} rx={plateR + 5} ry={22} fill="rgba(0,0,0,0.18)" filter="url(#blur)" />

      {/* 皿外枠 */}
      <circle cx={cx} cy={cy} r={plateR} fill="url(#plateGrad)" stroke="#D4C5A9" strokeWidth={8} />
      {/* 皿のリム装飾 */}
      <circle cx={cx} cy={cy} r={plateR - 10} fill="none" stroke="#E8D8C0" strokeWidth={2} />

      {/* ライスエリア */}
      {ricePercent > 0 && (
        <g clipPath="url(#plateClip)">
          <rect
            x={cx - innerR}
            y={cy - innerR}
            width={innerR * 2 * riceWidthRatio}
            height={innerR * 2}
            fill="url(#riceGrad)"
          />
          {/* ライスの粒テクスチャ */}
          {Array.from({ length: Math.min(ricePercent * 2, 120) }, (_, i) => {
            const rand = seededRandom(i * 17 + 3);
            const px = cx - innerR + rand() * innerR * 2 * riceWidthRatio;
            const py = cy - innerR + rand() * innerR * 2;
            const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
            if (dist > innerR - 5) return null;
            return (
              <ellipse
                key={i}
                cx={px}
                cy={py}
                rx={3 + rand() * 2}
                ry={1.5}
                fill="rgba(255,255,255,0.8)"
                transform={`rotate(${rand() * 180}, ${px}, ${py})`}
              />
            );
          })}
        </g>
      )}

      {/* カレーエリア */}
      {curryPercent > 0 && (
        <g clipPath="url(#plateClip)">
          <rect
            x={splitX}
            y={cy - innerR}
            width={innerR * 2 * curryWidthRatio}
            height={innerR * 2}
            fill="url(#curryGrad)"
          />
          {/* カレーのテクスチャ（スパイスの粒） */}
          {Array.from({ length: Math.min(curryPercent, 60) }, (_, i) => {
            const rand = seededRandom(i * 31 + 7);
            const px = splitX + rand() * innerR * 2 * curryWidthRatio;
            const py = cy - innerR + rand() * innerR * 2;
            const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
            if (dist > innerR - 5) return null;
            return (
              <circle
                key={i}
                cx={px}
                cy={py}
                r={1 + rand() * 2}
                fill={`rgba(${100 + Math.floor(rand() * 80)}, ${50 + Math.floor(rand() * 40)}, 0, 0.5)`}
              />
            );
          })}
        </g>
      )}

      {/* ライスとカレーの境界線 */}
      {ricePercent > 0 && curryPercent > 0 && (
        <g clipPath="url(#plateClip)">
          <line
            x1={splitX}
            y1={cy - innerR}
            x2={splitX}
            y2={cy + innerR}
            stroke="rgba(180,130,60,0.6)"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
        </g>
      )}

      {/* 食材アイコン（クリッピング適用） */}
      <g clipPath="url(#plateClip)">
        {icons.map((icon, i) => (
          <IngredientIcon key={i} icon={icon} />
        ))}
      </g>

      {/* 皿の光沢 */}
      <ellipse
        cx={cx - 45}
        cy={cy - 55}
        rx={28}
        ry={16}
        fill="rgba(255,255,255,0.25)"
        transform={`rotate(-30, ${cx - 45}, ${cy - 55})`}
      />

      {/* 湯気 */}
      <g opacity={0.5}>
        <path
          d={`M${cx - 30},${cy - plateR - 5} Q${cx - 35},${cy - plateR - 25} ${cx - 30},${cy - plateR - 45}`}
          stroke="rgba(200,200,220,0.7)"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M${cx},${cy - plateR - 5} Q${cx + 8},${cy - plateR - 28} ${cx},${cy - plateR - 50}`}
          stroke="rgba(200,200,220,0.7)"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M${cx + 30},${cy - plateR - 5} Q${cx + 25},${cy - plateR - 25} ${cx + 30},${cy - plateR - 45}`}
          stroke="rgba(200,200,220,0.7)"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* 比率ラベル（皿の上） */}
      {ricePercent > 15 && (
        <text
          x={cx - innerR + innerR * riceWidthRatio * 0.5}
          y={cy + 5}
          textAnchor="middle"
          fontSize={13}
          fontWeight="bold"
          fill="rgba(120,100,60,0.7)"
          clipPath="url(#plateClip)"
        >
          🍚{ricePercent}%
        </text>
      )}
      {curryPercent > 15 && (
        <text
          x={splitX + innerR * curryWidthRatio * 0.5}
          y={cy + 5}
          textAnchor="middle"
          fontSize={13}
          fontWeight="bold"
          fill="rgba(255,255,255,0.85)"
          clipPath="url(#plateClip)"
        >
          🍛{curryPercent}%
        </text>
      )}
    </svg>
  );
}
