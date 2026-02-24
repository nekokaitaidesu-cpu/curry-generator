"use client";

/**
 * メインページ
 * ランダムカレー生成器のメインUI
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CurryIllustration from "@/components/CurryIllustration";
import NutritionPanel from "@/components/NutritionPanel";
import IngredientPanel from "@/components/IngredientPanel";
import MyCurryForm from "@/components/MyCurryForm";
import {
  CurryResult,
  generateCurry,
  generateAllRandom,
  createMyCurry,
  getDefaultEnabledIngredients,
} from "@/lib/curry-generator";
import { Ingredient, INGREDIENTS } from "@/lib/ingredients";

type Tab = "result" | "ingredients";
type AppMode = "random" | "mycurry";

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>("random");
  const [activeTab, setActiveTab] = useState<Tab>("result");
  const [result, setResult] = useState<CurryResult | null>(null);
  const [enabledIds, setEnabledIds] = useState<Set<string>>(
    getDefaultEnabledIngredients
  );
  const [isCooking, setIsCooking] = useState(false);
  const [cookCount, setCookCount] = useState(0);

  /** カレーを作る！ボタンのハンドラ */
  const handleCook = useCallback(async () => {
    if (isCooking) return;
    setIsCooking(true);
    await new Promise((r) => setTimeout(r, 600));
    const newResult = generateCurry(enabledIds);
    setResult(newResult);
    setCookCount((c) => c + 1);
    setActiveTab("result");
    setIsCooking(false);
  }, [enabledIds, isCooking]);

  /** オールランダム！ボタンのハンドラ */
  const handleAllRandom = useCallback(async () => {
    if (isCooking) return;
    setIsCooking(true);
    await new Promise((r) => setTimeout(r, 600));
    const newResult = generateAllRandom();
    setResult(newResult);
    setCookCount((c) => c + 1);
    setActiveTab("result");
    setIsCooking(false);
  }, [isCooking]);

  /** マイカレー作成ハンドラ */
  const handleMyCurrySubmit = useCallback(
    async (
      riceGrams: number,
      rouGrams: number,
      ingredients: { id: string; amount: number }[]
    ) => {
      if (isCooking) return;
      setIsCooking(true);
      await new Promise((r) => setTimeout(r, 600));
      const newResult = createMyCurry(riceGrams, rouGrams, ingredients);
      setResult(newResult);
      setCookCount((c) => c + 1);
      setActiveTab("result");
      setIsCooking(false);
    },
    [isCooking]
  );

  /** 食材トグル */
  const handleToggle = useCallback((id: string) => {
    setEnabledIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  /** カテゴリ全選択 */
  const handleSelectAll = useCallback((category: Ingredient["category"]) => {
    setEnabledIds((prev) => {
      const next = new Set(prev);
      INGREDIENTS.filter((i) => i.category === category).forEach((i) =>
        next.add(i.id)
      );
      return next;
    });
  }, []);

  /** カテゴリ全解除 */
  const handleDeselectAll = useCallback((category: Ingredient["category"]) => {
    setEnabledIds((prev) => {
      const next = new Set(prev);
      INGREDIENTS.filter((i) => i.category === category).forEach((i) =>
        next.delete(i.id)
      );
      return next;
    });
  }, []);

  const enabledCount = enabledIds.size;

  return (
    <div className="app-container">
      {/* ヘッダー */}
      <header className="app-header">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="header-emoji">🍛</div>
          <h1 className="app-title">ランダムカレー生成器</h1>
          <p className="app-subtitle">
            どんなカレーが完成するかな？運命に身を委ねよう！
          </p>
        </motion.div>
      </header>

      {/* メインコンテンツ */}
      <main className="main-content">
        {/* モード切替スイッチャー */}
        <div className="mode-switcher">
          <button
            className={`mode-button ${appMode === "random" ? "active" : ""}`}
            onClick={() => setAppMode("random")}
          >
            🎲 ランダム生成
          </button>
          <button
            className={`mode-button ${appMode === "mycurry" ? "active" : ""}`}
            onClick={() => setAppMode("mycurry")}
          >
            👨‍🍳 マイカレー作成
          </button>
        </div>

        {/* カレーイラスト */}
        <motion.div
          className="illustration-wrapper"
          animate={
            isCooking
              ? { rotate: [0, -3, 3, -2, 2, 0], scale: [1, 1.02, 1] }
              : {}
          }
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={cookCount}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <CurryIllustration result={result} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* 比率表示 */}
        <AnimatePresence>
          {result && (
            <motion.div
              className="ratio-display"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="ratio-bar-wrapper">
                <motion.div
                  className="ratio-bar-rice"
                  initial={{ width: "50%" }}
                  animate={{ width: `${result.ricePercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                <motion.div
                  className="ratio-bar-curry"
                  initial={{ width: "50%" }}
                  animate={{ width: `${result.curryPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <div className="ratio-labels">
                <span className="ratio-rice">
                  🍚 ご飯 <strong>{result.ricePercent}%</strong>
                  <span className="ratio-grams">（{result.riceGrams}g）</span>
                </span>
                <span className="ratio-separator">:</span>
                <span className="ratio-curry">
                  🍛 カレー <strong>{result.curryPercent}%</strong>
                  <span className="ratio-grams">（{result.rouGrams}g）</span>
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ======== ランダム生成モード ======== */}
        <AnimatePresence mode="wait">
          {appMode === "random" && (
            <motion.div
              key="random-controls"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="random-buttons-wrapper">
                {/* カレーを作る！ボタン */}
                <motion.button
                  className={`cook-button ${isCooking ? "cooking" : ""}`}
                  onClick={handleCook}
                  disabled={isCooking}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    isCooking
                      ? {
                          boxShadow: [
                            "0 0 0 0 rgba(255, 165, 0, 0)",
                            "0 0 0 20px rgba(255, 165, 0, 0.3)",
                            "0 0 0 0 rgba(255, 165, 0, 0)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 0.6, repeat: isCooking ? Infinity : 0 }}
                >
                  {isCooking ? (
                    <span className="cooking-text">
                      <span className="cooking-emoji">🌀</span> 調理中...
                    </span>
                  ) : (
                    <span>
                      <span className="button-emoji">🍲</span> カレーを作る！
                    </span>
                  )}
                </motion.button>

                {/* オールランダム！ボタン */}
                <motion.button
                  className="all-random-button"
                  onClick={handleAllRandom}
                  disabled={isCooking}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCooking ? (
                    <span className="cooking-text">
                      <span className="cooking-emoji">🌀</span> 調理中...
                    </span>
                  ) : (
                    <span>🎰 オールランダム！</span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 反応コメント */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.comment}
              className="comment-box"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <p className="comment-text">{result.comment}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* タブ */}
        <div className="tab-container">
          <div className="tab-bar">
            <button
              className={`tab-button ${activeTab === "result" ? "active" : ""}`}
              onClick={() => setActiveTab("result")}
            >
              📋 結果詳細
            </button>
            {appMode === "random" && (
              <button
                className={`tab-button ${activeTab === "ingredients" ? "active" : ""}`}
                onClick={() => setActiveTab("ingredients")}
              >
                🥘 食材設定
                {enabledCount > 0 && (
                  <span className="tab-badge">{enabledCount}</span>
                )}
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {result ? (
                  <div className="result-panel">
                    {/* 食材リスト */}
                    {result.ingredients.length > 0 && (
                      <div className="ingredient-result-list">
                        <h3 className="section-title">🧅 入った食材</h3>
                        <div className="ingredient-result-grid">
                          {result.ingredients.map(({ ingredient, amount }) => (
                            <div
                              key={ingredient.id}
                              className="ingredient-result-chip"
                            >
                              <span
                                className="ingredient-result-dot"
                                style={{ backgroundColor: ingredient.color }}
                              />
                              <span className="ingredient-result-name">
                                {ingredient.name}
                              </span>
                              <span className="ingredient-result-amount">
                                {amount}
                                {ingredient.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 栄養情報 */}
                    <NutritionPanel nutrition={result.nutrition} />

                    {/* 合計グラム数 */}
                    <div className="total-grams-panel">
                      <h3 className="section-title">⚖️ 合計グラム数</h3>
                      <div className="total-grams-rows">
                        <div className="total-grams-row">
                          <span className="total-grams-label">🍚 ご飯</span>
                          <span className="total-grams-value">{result.riceGrams}g</span>
                        </div>
                        <div className="total-grams-row">
                          <span className="total-grams-label">🍛 カレールー</span>
                          <span className="total-grams-value">{result.rouGrams}g</span>
                        </div>
                        {result.ingredients.map(({ ingredient, amount }) => (
                          <div key={ingredient.id} className="total-grams-row">
                            <span className="total-grams-label">
                              <span
                                className="ingredient-result-dot"
                                style={{ backgroundColor: ingredient.color }}
                              />
                              {ingredient.name}
                            </span>
                            <span className="total-grams-value">
                              {amount}{ingredient.unit}
                            </span>
                          </div>
                        ))}
                        <div className="total-grams-row total-grams-sum">
                          <span className="total-grams-label">合計</span>
                          <span className="total-grams-value">{result.totalGrams}g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-result">
                    <p className="empty-main">まだカレーがありません 🍛</p>
                    <p className="empty-sub">
                      {appMode === "random"
                        ? "「カレーを作る！」ボタンを押してね"
                        : "食材と量を入力して「このカレーを作る！」を押してね"}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "ingredients" && appMode === "random" && (
              <motion.div
                key="ingredients"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <IngredientPanel
                  enabledIds={enabledIds}
                  onToggle={handleToggle}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ======== マイカレー作成モード ======== */}
        <AnimatePresence mode="wait">
          {appMode === "mycurry" && (
            <motion.div
              key="mycurry-form"
              className="tab-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="tab-bar">
                <div className="tab-button active" style={{ cursor: "default" }}>
                  👨‍🍳 マイカレーを作成する
                </div>
              </div>
              <MyCurryForm
                onSubmit={handleMyCurrySubmit}
                isSubmitting={isCooking}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* フッター */}
      <footer className="app-footer">
        <p>🍛 ランダムカレー生成器 — 本日も謎のカレーを召し上がれ</p>
      </footer>
    </div>
  );
}
