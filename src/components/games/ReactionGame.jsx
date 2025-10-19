import React, { useState, useEffect, useRef } from "react";
import { Zap, Trophy, RotateCcw } from "lucide-react";

const ReactionGame = ({ onGameOver }) => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [boxes, setBoxes] = useState([]);
  const [clicked, setClicked] = useState(0);
  const clickedRef = useRef(0);
  const [gameState, setGameState] = useState("menu"); // menu | playing | over | ready
  const [roundTimer, setRoundTimer] = useState(null);
  const [message, setMessage] = useState("");

  const baseVanishTime = 6000;
  const baseBoxCount = 3;

  // 🎯 Run startLevel every time game starts or level changes
  useEffect(() => {
    if (gameState === "playing") startLevel();
  }, [gameState, level]);

  const startGame = () => {
    setLevel(1);
    setScore(0);
    scoreRef.current = 0;
    setGameState("ready");
    showGetReady();
  };

  const showGetReady = () => {
    setMessage("Get Ready...");
    setBoxes([]);
    setTimeout(() => {
      setMessage("");
      setGameState("playing");
    }, 1000);
  };

  const startLevel = () => {
    const count = baseBoxCount + (level - 1) * 2;
    const vanishTime = Math.max(2000, baseVanishTime - (level - 1) * 500);
    const newBoxes = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      visible: true,
    }));

    clickedRef.current = 0;
    setBoxes(newBoxes);
    setClicked(0);

    if (roundTimer) clearTimeout(roundTimer);
    const timer = setTimeout(() => endLevel(count), vanishTime);
    setRoundTimer(timer);
  };

  const clickBox = (id) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, visible: false } : b))
    );
    setClicked((c) => c + 1);
    clickedRef.current += 1;
    setScore((s) => {
      const newScore = s + 50;
      scoreRef.current = newScore;
      return newScore;
    });
  };

  const endLevel = (count) => {
    const required = Math.ceil(count / 2);
    const actualClicks = clickedRef.current;

    if (actualClicks >= required) {
      // ✅ Bigger level-clear bonus (scales with level and performance)
      const levelBonus = 200 + level * 100 + actualClicks * 25;

      setScore((s) => {
        const newScore = s + levelBonus;
        scoreRef.current = newScore;
        return newScore;
      });

      setMessage(`Level ${level} Clear! +${levelBonus} pts`);
      setTimeout(() => {
        setMessage("");
        setLevel((l) => l + 1);
        setGameState("ready");
        showGetReady();
      }, 1200);
    } else {
      setGameState("over");
      if (onGameOver) onGameOver(scoreRef.current);
    }
  };

  const resetGame = () => {
    if (roundTimer) clearTimeout(roundTimer);
    setGameState("menu");
    setBoxes([]);
    setScore(0);
    scoreRef.current = 0;
    setLevel(1);
    setMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-pink-800 text-white p-4">
      {/* 🎮 MENU */}
      {gameState === "menu" && (
        <div className="text-center w-full max-w-md space-y-5">
          <Zap className="w-12 h-12 mx-auto mb-2 text-yellow-400 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-300 bg-clip-text text-transparent">
            REACTION
          </h1>
          <p className="text-base text-gray-300">Test your reflexes</p>
          <div className="bg-pink-800/30 rounded-lg p-4 border border-pink-500/40">
            <h3 className="text-md font-semibold mb-2 text-pink-300">
              How to Play
            </h3>
            <ul className="text-sm text-gray-300 space-y-1 text-left">
              <li>● Wait for boxes to appear</li>
              <li>● Click them before they vanish</li>
              <li>● Clear each level to earn bonus points</li>
            </ul>
          </div>
          <button
            onClick={startGame}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg text-lg font-bold hover:from-pink-400 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg"
          >
            PLAY NOW
          </button>
        </div>
      )}

      {/* 🕹️ READY or PLAYING */}
      {(gameState === "playing" || gameState === "ready") && (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <div className="flex justify-between w-full">
            <div className="bg-pink-800/30 rounded-lg p-3 border border-pink-500/40 text-center flex-1 mx-1">
              <p className="text-xs text-gray-300">Level</p>
              <p className="text-2xl font-bold text-yellow-400">{level}</p>
            </div>
            <div className="bg-pink-800/30 rounded-lg p-3 border border-pink-500/40 text-center flex-1 mx-1">
              <p className="text-xs text-gray-300">Score</p>
              <p className="text-2xl font-bold text-green-400">{score}</p>
            </div>
          </div>

          <div className="relative bg-black rounded-xl border-4 border-pink-500/30 shadow-lg overflow-hidden w-[350px] h-[350px] flex items-center justify-center">
            {message && (
              <div className="absolute text-2xl font-bold text-pink-400 animate-pulse">
                {message}
              </div>
            )}

            {gameState === "playing" &&
              boxes.map(
                (box) =>
                  box.visible && (
                    <div
                      key={box.id}
                      onClick={() => clickBox(box.id)}
                      className="absolute w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 rounded-lg cursor-pointer transition-transform transform hover:scale-110 shadow-md border border-pink-300/50"
                      style={{
                        top: `${box.y}%`,
                        left: `${box.x}%`,
                        transform: "translate(-50%, -50%)",
                        animation: `fadeOut ${Math.max(
                          2,
                          6 - (level - 1) * 0.5
                        )}s linear forwards`,
                      }}
                    ></div>
                  )
              )}
          </div>

          <button
            onClick={resetGame}
            className="px-5 py-2 bg-pink-700/40 hover:bg-pink-600/50 rounded-md flex items-center gap-2 font-bold text-sm transition-all transform hover:scale-105 shadow-md border border-pink-500/50"
          >
            <RotateCcw className="w-4 h-4" /> Exit Game
          </button>
        </div>
      )}

      {/* 🏁 GAME OVER */}
      {gameState === "over" && (
        <div className="text-center w-full max-w-sm space-y-5">
          <Trophy className="w-14 h-14 text-yellow-400 mx-auto animate-bounce" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            GAME OVER
          </h2>
          <div className="bg-pink-800/30 rounded-lg p-6 border border-pink-500/40">
            <p className="text-4xl font-bold text-green-400 mb-1">
              {scoreRef.current}
            </p>
            <p className="text-gray-300 text-sm">Final Score</p>
          </div>
          <button
            onClick={resetGame}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-lg font-bold rounded-lg hover:from-pink-500 hover:to-purple-500 transform hover:scale-105 transition-all shadow-lg"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          90% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
        }
      `}</style>
    </div>
  );
};

export default ReactionGame;
