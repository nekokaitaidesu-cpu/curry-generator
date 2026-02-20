/**
 * カレー生成ロジック
 * ランダム生成、反応コメント、栄養計算などを担当する
 */

import { INGREDIENTS, Ingredient, UNIT_WEIGHT } from "./ingredients";

/** 生成されたカレーの結果 */
export interface CurryResult {
  /** ライスの割合 (0-100) */
  ricePercent: number;
  /** カレーの割合 (0-100) */
  curryPercent: number;
  /** 有効化された食材とその量 */
  ingredients: IngredientResult[];
  /** 反応コメント */
  comment: string;
  /** 栄養情報 */
  nutrition: NutritionInfo;
}

export interface IngredientResult {
  ingredient: Ingredient;
  /** ランダムに決まった量 */
  amount: number;
}

export interface NutritionInfo {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  sodium: number;
  fiber: number;
}

/**
 * ライス比率に応じた反応コメント（複数バリエーション付き）
 * インデックスはライス%を10で割った値（0〜10）
 */
const REACTION_COMMENTS: string[][] = [
  // 0% rice / 100% curry
  [
    "え、これってスープカレーですか…？ご飯はどこ？ナンは？🍲",
    "カレーの海で溺れそうです。救助船（ご飯）を呼んでください！",
    "ご飯ゼロ！？カレー原液を飲む覚悟ができてますか…？",
  ],
  // 10% rice / 90% curry
  [
    "ご飯一粒がカレーの大海を泳いでいます…健気な奴…🌊",
    "ご飯10%の孤独な戦い。カレーに囲まれて必死に生きている。",
    "この少ないご飯で90%のカレーを制するつもりですか？無謀です。",
  ],
  // 20% rice / 80% curry
  [
    "カレーの方が断然主役！ご飯は脇役に徹する覚悟を見せています。",
    "ご飯20%…カレー過激派の皿ですね。勇気がいります。",
    "カレー愛が強すぎてご飯の出番が少ない。分かります。",
  ],
  // 30% rice / 70% curry
  [
    "カレーが主人公、ご飯は引き立て役。これはこれでアリ！🍛",
    "70%カレーの皿…カレー党員必携の一枚です。",
    "ご飯よりカレーが多い。カレー屋さんが喜びそうな黄金比？",
  ],
  // 40% rice / 60% curry
  [
    "カレー強め、でも絶妙なバランス。上級者の域に入ってきました！",
    "カレー多めの贅沢な一皿。60%カレーは正しい選択かもしれない。",
    "ご飯:カレー = 4:6。カレーが少しだけ威張っている感じがして好きです。",
  ],
  // 50% rice / 50% curry
  [
    "完璧なバランス！これぞカレーの黄金比✨神の皿と呼んでいいでしょう！",
    "50:50！数学的に美しい。カレーの神様も満足しているはず。",
    "黄金比50:50達成！あなたはカレーマスターの素質があります！🏆",
  ],
  // 60% rice / 40% curry
  [
    "ご飯が少し優勢になってきましたが、まだ許容範囲内です。",
    "ご飯多めで安定感がある。家庭的な優しい味がしそうです。",
    "ご飯60%…カレーもまだ頑張っています。良い戦いをしています。",
  ],
  // 70% rice / 30% curry
  [
    "これはカレーご飯なのか、ご飯カレーなのか…哲学的な問いですね。",
    "カレー少な目…もうこれ「カレー風味ご飯」では？😅",
    "ご飯70%。カレーが「もうちょっとあってもよかったのに…」と思っています。",
  ],
  // 80% rice / 20% curry
  [
    "ほぼご飯じゃないですか！カレーがちょっと泣いています…😢",
    "カレーがご飯の海で溺れています。立場が逆転しました。",
    "カレー20%…これはカレーライスではなく「ライスカレー」の極端な例です。",
  ],
  // 90% rice / 10% curry
  [
    "カレーがほとんど見えません。ご飯の山の向こうに小さなカレーが…⛰️",
    "カレー10%の切なさよ。まるでご飯の海に浮かぶ孤島のようです。",
    "これもうただのご飯に少しカレーをこぼした感じじゃないですか？",
  ],
  // 100% rice / 0% curry
  [
    "カレーゼロ！！ただの白ご飯じゃないですか！！会議終了！次回に期待！🍚",
    "カレーが存在しない。これはカレーライスという名の白ご飯です。閉廷！",
    "カレー0%…あなたはご飯単品を注文しました。なぜここに来たのですか？",
  ],
];

/**
 * ランダムな整数を生成する（min以上max以下）
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * カレーを生成する
 * @param enabledIngredientIds 有効化された食材IDのセット
 */
export function generateCurry(enabledIngredientIds: Set<string>): CurryResult {
  // ライス:カレー比率をランダム生成
  const ricePercent = randomInt(0, 100);
  const curryPercent = 100 - ricePercent;

  // 反応コメントを選択
  const commentIndex = Math.round(ricePercent / 10);
  const commentGroup = REACTION_COMMENTS[commentIndex];
  const comment = commentGroup[randomInt(0, commentGroup.length - 1)];

  // 有効食材の量をランダム生成
  const ingredientResults: IngredientResult[] = [];
  for (const ingredient of INGREDIENTS) {
    if (enabledIngredientIds.has(ingredient.id)) {
      // 最低1単位は入れる、最大はmaxAmount
      const minAmount = ingredient.unit === "g" ? 10 : 1;
      const amount = randomInt(minAmount, ingredient.maxAmount);
      ingredientResults.push({ ingredient, amount });
    }
  }

  // 栄養計算
  const nutrition = calculateNutrition(
    ricePercent,
    curryPercent,
    ingredientResults
  );

  return {
    ricePercent,
    curryPercent,
    ingredients: ingredientResults,
    comment,
    nutrition,
  };
}

/**
 * 栄養情報を計算する
 */
function calculateNutrition(
  ricePercent: number,
  curryPercent: number,
  ingredients: IngredientResult[]
): NutritionInfo {
  // ご飯の基本量（300gを基準にricePercentでスケール）
  const riceGrams = (ricePercent / 100) * 300;
  // カレールーの基本量（200gを基準にcurryPercentでスケール）
  const rouGrams = (curryPercent / 100) * 200;

  // ご飯の栄養（per 100g: 168kcal, 2.5g protein, 0.3g fat, 37g carbs, 1mg sodium, 0.3g fiber）
  const riceNutrition: NutritionInfo = {
    kcal: (riceGrams / 100) * 168,
    protein: (riceGrams / 100) * 2.5,
    fat: (riceGrams / 100) * 0.3,
    carbs: (riceGrams / 100) * 37,
    sodium: (riceGrams / 100) * 1,
    fiber: (riceGrams / 100) * 0.3,
  };

  // カレールーの栄養（per 100g: 510kcal, 8g protein, 32g fat, 48g carbs, 2800mg sodium, 3g fiber）
  const rouNutrition: NutritionInfo = {
    kcal: (rouGrams / 100) * 510,
    protein: (rouGrams / 100) * 8,
    fat: (rouGrams / 100) * 32,
    carbs: (rouGrams / 100) * 48,
    sodium: (rouGrams / 100) * 2800,
    fiber: (rouGrams / 100) * 3,
  };

  // 食材の栄養合計
  const ingredientNutrition = ingredients.reduce(
    (acc, { ingredient, amount }) => {
      // 重量に換算
      const grams = amount * UNIT_WEIGHT[ingredient.unit];
      const factor = grams / 100;
      return {
        kcal: acc.kcal + ingredient.kcalPer100g * factor,
        protein: acc.protein + ingredient.proteinPer100g * factor,
        fat: acc.fat + ingredient.fatPer100g * factor,
        carbs: acc.carbs + ingredient.carbsPer100g * factor,
        sodium: acc.sodium + ingredient.sodiumPer100g * factor,
        fiber: acc.fiber + ingredient.fiberPer100g * factor,
      };
    },
    { kcal: 0, protein: 0, fat: 0, carbs: 0, sodium: 0, fiber: 0 }
  );

  return {
    kcal: Math.round(riceNutrition.kcal + rouNutrition.kcal + ingredientNutrition.kcal),
    protein: Math.round((riceNutrition.protein + rouNutrition.protein + ingredientNutrition.protein) * 10) / 10,
    fat: Math.round((riceNutrition.fat + rouNutrition.fat + ingredientNutrition.fat) * 10) / 10,
    carbs: Math.round((riceNutrition.carbs + rouNutrition.carbs + ingredientNutrition.carbs) * 10) / 10,
    sodium: Math.round(riceNutrition.sodium + rouNutrition.sodium + ingredientNutrition.sodium),
    fiber: Math.round((riceNutrition.fiber + rouNutrition.fiber + ingredientNutrition.fiber) * 10) / 10,
  };
}

/** デフォルトで有効な食材のIDセット */
export function getDefaultEnabledIngredients(): Set<string> {
  return new Set(
    INGREDIENTS.filter((i) => i.defaultEnabled).map((i) => i.id)
  );
}
