"use client";

import React, { useState, useEffect } from "react";

interface GameConfig {
  id: string;
  name: string;
  icon: string;
  defaultPrefix: string;
  theme: {
    badge: string;
    addBtn: string;
    resetBtn: string;
    announceBtn: string;
    playerHeaderBg: string;
    totalRowBg: string;
    totalTextColor: string;
    winnerBgClass: string;
  };
  categories: { id: string; name: string }[];
  tieBreakerTip?: string;
}

const WS_CONFIG: GameConfig = {
  id: "wingspan",
  name: "展仪翱翔 (Wingspan)",
  icon: "🐦",
  defaultPrefix: "玩家",
  theme: {
    badge: "text-teal-700",
    addBtn: "bg-sky-600 hover:bg-sky-700",
    resetBtn: "bg-red-600 hover:bg-red-700",
    announceBtn: "bg-purple-600 hover:bg-purple-700",
    playerHeaderBg: "bg-cyan-100",
    totalRowBg: "bg-amber-100",
    totalTextColor: "text-amber-900",
    winnerBgClass: "winner-col-ws",
  },
  categories: [
    { id: "birds", name: "🐦鸟牌总分" },
    { id: "bonus", name: "⭐奖励卡分" },
    { id: "goals", name: "🏆轮末目标" },
    { id: "eggs", name: "🥚鸟蛋总分" },
    { id: "food", name: "🍇贮藏食物" },
    { id: "tucked", name: "🔀塞入卡片" },
  ],
  tieBreakerTip: "Wingspan平局提示：平局时，剩余食物最多者获胜。",
};

const PARKS_CONFIG: GameConfig = {
  id: "parks",
  name: "国家公园 2 (PARKS 2)",
  icon: "🌲",
  defaultPrefix: "Hiker",
  theme: {
    badge: "text-green-800",
    addBtn: "bg-green-600 hover:bg-green-700",
    resetBtn: "bg-red-600 hover:bg-red-700",
    announceBtn: "bg-purple-600 hover:bg-purple-700",
    playerHeaderBg: "bg-green-100",
    totalRowBg: "bg-orange-100",
    totalTextColor: "text-orange-900",
    winnerBgClass: "winner-col-parks",
  },
  categories: [
    { id: "parks", name: "🌲公园总分" },
    { id: "personal", name: "🧑个人目标" },
    { id: "photos", name: "🖼️照片总分" },
    { id: "photoBonus", name: "📷照片奖励" },
    { id: "season", name: "📅季节奖励" },
    { id: "starter", name: "🎖️起始玩家" },
  ],
  tieBreakerTip: "PARKS平局提示：游览国家公园最多者胜出。",
};

function SingleGameScorer({ config }: { config: GameConfig }) {
  const [players, setPlayers] = useState<string[]>([]);
  const [scores, setScores] = useState<number[][]>([]); // scores[categoryIndex][playerIndex]
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载数据
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`game_${config.id}`);
      if (saved) {
        const data = JSON.parse(saved);
        if (Array.isArray(data.players) && data.players.length > 0) {
          setPlayers(data.players);
          if (Array.isArray(data.scores)) {
            setScores(data.scores);
          } else {
            setScores(config.categories.map(() => data.players.map(() => 0)));
          }
          setIsLoaded(true);
          return;
        }
      }
    } catch {
      // 忽略解析错误
    }
    // 默认两位玩家
    const initPlayers = [`${config.defaultPrefix} 1`, `${config.defaultPrefix} 2`];
    setPlayers(initPlayers);
    setScores(config.categories.map(() => [0, 0]));
    setIsLoaded(true);
  }, [config]);

  // 保存到 localStorage
  useEffect(() => {
    if (!isLoaded || players.length === 0) return;
    try {
      localStorage.setItem(
        `game_${config.id}`,
        JSON.stringify({
          playerCount: players.length,
          players,
          scores,
        })
      );
    } catch {
      // ignore
    }
  }, [players, scores, isLoaded, config.id]);

  // 计算每位玩家的总分
  const playerTotals = players.map((_, pIdx) => {
    return scores.reduce((sum, row) => sum + (Number(row[pIdx]) || 0), 0);
  });

  const maxScore = Math.max(...playerTotals, 0);
  const hasScores = playerTotals.some((s) => s > 0);

  // 添加玩家
  const addPlayer = () => {
    const nextNum = players.length + 1;
    const newName = `${config.defaultPrefix} ${nextNum}`;
    setPlayers([...players, newName]);
    setScores(scores.map((row) => [...row, 0]));
  };

  // 移除玩家
  const removePlayer = (idx: number) => {
    if (players.length <= 1) {
      alert("至少保留一位玩家！");
      return;
    }
    setPlayers(players.filter((_, i) => i !== idx));
    setScores(scores.map((row) => row.filter((_, i) => i !== idx)));
  };

  // 更新名字
  const updatePlayerName = (idx: number, name: string) => {
    const updated = [...players];
    updated[idx] = name;
    setPlayers(updated);
  };

  // 更新分数
  const updateScore = (catIdx: number, pIdx: number, val: string) => {
    const num = val === "" ? 0 : parseInt(val, 10);
    const parsed = isNaN(num) ? 0 : num;
    setScores((prev) => {
      const next = prev.map((row) => [...row]);
      if (!next[catIdx]) {
        next[catIdx] = players.map(() => 0);
      }
      next[catIdx][pIdx] = parsed;
      return next;
    });
  };

  // 重置游戏
  const resetGame = () => {
    if (confirm("确定要重置当前游戏的分数吗？")) {
      setScores(config.categories.map(() => players.map(() => 0)));
    }
  };

  // 播报获胜者
  const announceWinner = () => {
    if (!hasScores || maxScore === 0) {
      alert("还没有获胜者，请先输入分数！");
      return;
    }
    try {
      const beep = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZSBQOX6vu8KxgGwU+ltryxHInBSx+zO/ZkD4JFmi07OylUBELTKXh8bllHAY5j9byw3opBSl3xO/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/gk0QLGGO68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQLF2O68+ylUxEKTqnk8bllHAY6kNXywHknBSl3w+/glEQ==');
      beep.play().catch(() => {});
    } catch {}

    const winners = players.filter((_, idx) => playerTotals[idx] === maxScore);
    if (winners.length === 1) {
      alert(`🎉 恭喜 【${winners[0]}】 获得胜利！\n总分：${maxScore} 分！`);
    } else {
      alert(`🎉 恭喜出现平局获胜！\n获胜者：${winners.join("、")}\n总分：${maxScore} 分！\n${config.tieBreakerTip || ""}`);
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className={`text-xl font-bold ${config.theme.badge}`}>
          {config.icon} {config.name}
        </h2>
        <div className="flex flex-shrink-0 gap-3">
          <button
            onClick={addPlayer}
            className={`${config.theme.addBtn} cursor-pointer rounded-lg px-4 py-2 font-bold text-white transition-colors shadow-sm`}
          >
            ＋ 添加玩家
          </button>
          <button
            onClick={resetGame}
            className={`${config.theme.resetBtn} cursor-pointer rounded-lg px-4 py-2 font-bold text-white transition-colors shadow-sm`}
          >
            🔄 重置分数
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-max border-collapse">
          <thead>
            {/* 移除玩家行 */}
            <tr className="border-b border-gray-200 bg-stone-50">
              <th className="sticky left-0 z-10 bg-stone-50 p-2 text-center text-xs font-medium text-gray-500">
                操作
              </th>
              {players.map((_, pIdx) => (
                <th key={pIdx} className="p-2 text-center">
                  <button
                    onClick={() => removePlayer(pIdx)}
                    title="移除该玩家"
                    className="rounded bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-200 transition-colors"
                  >
                    ✕ 移除
                  </button>
                </th>
              ))}
            </tr>

            {/* 玩家名字行 */}
            <tr className={`border-b border-gray-200 ${config.theme.playerHeaderBg}`}>
              <th className="sticky left-0 z-10 bg-inherit p-3 text-left text-sm font-bold text-gray-800">
                计分项
              </th>
              {players.map((pName, pIdx) => (
                <th
                  key={pIdx}
                  className={`p-3 text-center ${
                    hasScores && playerTotals[pIdx] === maxScore ? config.theme.winnerBgClass : ""
                  }`}
                >
                  <input
                    type="text"
                    value={pName}
                    onChange={(e) => updatePlayerName(pIdx, e.target.value)}
                    className="player-name-input border border-gray-300 rounded bg-white px-2 py-1 text-center font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {config.categories.map((cat, catIdx) => (
              <tr key={cat.id} className="border-b border-gray-100 hover:bg-stone-50 transition-colors">
                <td className="sticky left-0 z-10 bg-white p-3 text-sm font-medium text-gray-700 shadow-[1px_0_0_#e5e7eb]">
                  {cat.name}
                </td>
                {players.map((_, pIdx) => (
                  <td
                    key={pIdx}
                    className={`p-2 text-center ${
                      hasScores && playerTotals[pIdx] === maxScore ? config.theme.winnerBgClass : ""
                    }`}
                  >
                    <input
                      type="number"
                      min={0}
                      value={scores[catIdx]?.[pIdx] ?? 0}
                      onChange={(e) => updateScore(catIdx, pIdx, e.target.value)}
                      className="table-input font-medium text-gray-900 focus:ring-2 focus:ring-blue-400"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className={`border-t-2 border-gray-300 ${config.theme.totalRowBg}`}>
              <td className="sticky left-0 z-10 bg-inherit p-4 text-left text-sm font-bold shadow-[1px_0_0_#e5e7eb]">
                <span className={`font-black ${config.theme.totalTextColor}`}>👑 总分</span>
              </td>
              {players.map((_, pIdx) => {
                const total = playerTotals[pIdx];
                const isWinner = hasScores && total === maxScore;
                return (
                  <td
                    key={pIdx}
                    className={`p-4 text-center font-black text-xl ${
                      isWinner ? `${config.theme.winnerBgClass} text-amber-700 scale-105` : "text-gray-800"
                    }`}
                  >
                    {total}
                    {isWinner && <span className="ml-1 text-base">🏆</span>}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-gray-500">{config.tieBreakerTip}</p>
        <button
          onClick={announceWinner}
          className={`${config.theme.announceBtn} cursor-pointer rounded-xl px-6 py-2.5 font-bold text-white shadow-md transition-all hover:scale-105`}
        >
          🎉 播报获胜者
        </button>
      </div>
    </section>
  );
}

export default function BoardGameScorer() {
  return (
    <div className="flex flex-col gap-8">
      <SingleGameScorer config={WS_CONFIG} />
      <SingleGameScorer config={PARKS_CONFIG} />
    </div>
  );
}
