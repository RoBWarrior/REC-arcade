import React, { useState, useEffect } from "react";
import { Trophy, Circle } from "lucide-react";

const ROWS = 6;
const COLS = 7;
const PLAYER = "red";
const COMPUTER = "blue";

const DIFFICULTY_POINTS = {
  easy: 100,
  medium: 250,
  hard: 500,
};

const Connect4 = ({ user, onGameOver }) => {
  const emptyBoard = () =>
    Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null));

  const [board, setBoard] = useState(emptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER);
  const [winner, setWinner] = useState(null);
  const [hoveredCol, setHoveredCol] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [gameState, setGameState] = useState("menu");
  const [score, setScore] = useState(0);

  // 🧠 Computer AI trigger
  useEffect(() => {
    if (
      gameState === "playing" &&
      currentPlayer === COMPUTER &&
      !winner &&
      !isComputerThinking
    ) {
      setIsComputerThinking(true);
      const t = setTimeout(() => {
        makeComputerMove();
        setIsComputerThinking(false);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [currentPlayer, winner, gameState]);

  const getLowestRow = (b, c) => {
    for (let r = ROWS - 1; r >= 0; r--) if (!b[r][c]) return r;
    return -1;
  };

  const isValidMove = (b, c) => c >= 0 && c < COLS && !b[0][c];

  const makeMove = (b, c, p) => {
    const row = getLowestRow(b, c);
    if (row === -1) return null;
    const nb = b.map((r) => [...r]);
    nb[row][c] = p;
    return nb;
  };

  const checkWinner = (b) => {
    const dirs = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const player = b[r][c];
        if (!player) continue;
        for (let [dr, dc] of dirs) {
          let chain = [[r, c]];
          for (let k = 1; k < 4; k++) {
            const nr = r + dr * k,
              nc = c + dc * k;
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
            if (b[nr][nc] === player) chain.push([nr, nc]);
          }
          if (chain.length === 4) return { winner: player, cells: chain };
        }
      }
    }
    return null;
  };

  const handleColumnClick = (col, byAI = false) => {
    if (winner || (!byAI && currentPlayer === COMPUTER)) return;
    if (!isValidMove(board, col)) return;
    const nb = makeMove(board, col, currentPlayer);
    const res = checkWinner(nb);
    setBoard(nb);
    if (res) {
      setWinner(res.winner);
      if (res.winner === PLAYER) {
        const earned = DIFFICULTY_POINTS[difficulty];
        setScore((prev) => prev + earned);
      } else if (res.winner === COMPUTER) {
        // 🧩 When AI wins → immediately end game
        setTimeout(() => {
          onGameOver(score);
          setGameState("menu");
        }, 800);
      }
    } else {
      setCurrentPlayer(currentPlayer === PLAYER ? COMPUTER : PLAYER);
    }
  };

  // -------------- AI LOGIC --------------

  const evaluateBoard = (b) => {
    let score = 0;
    const centerCol = Math.floor(COLS / 2);
    let centerCount = 0;
    for (let r = 0; r < ROWS; r++) {
      if (b[r][centerCol] === COMPUTER) centerCount++;
    }
    score += centerCount * 4;

    const evaluateWindow = (window) => {
      const comp = window.filter((c) => c === COMPUTER).length;
      const play = window.filter((c) => c === PLAYER).length;
      const empty = window.filter((c) => !c).length;
      if (comp === 4) score += 100;
      else if (comp === 3 && empty === 1) score += 10;
      else if (comp === 2 && empty === 2) score += 5;
      if (play === 3 && empty === 1) score -= 8;
    };

    // horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++)
        evaluateWindow([b[r][c], b[r][c + 1], b[r][c + 2], b[r][c + 3]]);
    }
    // vertical
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 3; r++)
        evaluateWindow([b[r][c], b[r + 1][c], b[r + 2][c], b[r + 3][c]]);
    }
    return score;
  };

  const minimax = (b, depth, alpha, beta, maximizing) => {
    const res = checkWinner(b);
    if (res) {
      if (res.winner === COMPUTER) return { score: 100000 };
      if (res.winner === PLAYER) return { score: -100000 };
    }
    if (depth === 0) return { score: evaluateBoard(b) };

    const valid = [];
    for (let c = 0; c < COLS; c++) if (isValidMove(b, c)) valid.push(c);
    if (!valid.length) return { score: 0 };

    if (maximizing) {
      let maxEval = -Infinity;
      let bestCol = valid[0];
      for (let col of valid) {
        const child = makeMove(b, col, COMPUTER);
        const evalResult = minimax(child, depth - 1, alpha, beta, false).score;
        if (evalResult > maxEval) {
          maxEval = evalResult;
          bestCol = col;
        }
        alpha = Math.max(alpha, evalResult);
        if (alpha >= beta) break;
      }
      return { col: bestCol, score: maxEval };
    } else {
      let minEval = Infinity;
      let bestCol = valid[0];
      for (let col of valid) {
        const child = makeMove(b, col, PLAYER);
        const evalResult = minimax(child, depth - 1, alpha, beta, true).score;
        if (evalResult < minEval) {
          minEval = evalResult;
          bestCol = col;
        }
        beta = Math.min(beta, evalResult);
        if (alpha >= beta) break;
      }
      return { col: bestCol, score: minEval };
    }
  };

  const makeComputerMove = () => {
    const valid = [];
    for (let c = 0; c < COLS; c++) if (isValidMove(board, c)) valid.push(c);
    if (!valid.length) return;
    let choice;

    if (difficulty === "easy") {
      choice = valid[Math.floor(Math.random() * valid.length)];
    } else if (difficulty === "medium") {
      for (let c of valid) {
        const test = makeMove(board, c, COMPUTER);
        if (checkWinner(test)?.winner === COMPUTER) {
          choice = c;
          break;
        }
      }
      if (choice === undefined) {
        for (let c of valid) {
          const test = makeMove(board, c, PLAYER);
          if (checkWinner(test)?.winner === PLAYER) {
            choice = c;
            break;
          }
        }
      }
      if (choice === undefined)
        choice = valid[Math.floor(Math.random() * valid.length)];
    } else {
      const { col } = minimax(board, 4, -Infinity, Infinity, true);
      choice = col ?? valid[Math.floor(Math.random() * valid.length)];
    }
    handleColumnClick(choice, true);
  };

  // -------------- Controls --------------

  const resetGame = () => {
    setBoard(emptyBoard());
    setWinner(null);
    setCurrentPlayer(PLAYER);
  };

  const startGame = () => {
    resetGame();
    setScore(0);
    setGameState("playing");
  };

  const endGame = () => {
    onGameOver(score); // Submit score
    setGameState("menu");
  };

  // -------------- UI --------------

  if (gameState === "menu")
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-900 via-orange-900 to-yellow-800 text-white overflow-hidden">
        <Circle className="w-24 h-24 mb-6 text-yellow-300 animate-pulse" />
        <h1 className="text-6xl font-bold mb-3 text-yellow-300 tracking-wide drop-shadow-lg">
          CONNECT 4
        </h1>
        <p className="mb-8 text-xl text-gray-200 text-center">
          Drop discs. Connect 4. Beat the A.I.
        </p>

        <div className="flex items-center gap-3 mb-8">
          <label className="text-lg font-semibold">Select Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-4 py-2 rounded-md bg-gray-800 border border-yellow-400 text-white font-semibold focus:outline-none"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button
          onClick={startGame}
          className="px-12 py-4 bg-yellow-500 text-black font-extrabold rounded-xl hover:bg-yellow-400 transition-all text-2xl shadow-lg transform hover:scale-105"
        >
          PLAY NOW
        </button>
      </div>
    );

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-900 via-orange-900 to-yellow-800 text-white overflow-hidden">
      <div className="flex flex-col items-center justify-between h-[95vh] py-4">
        <h1 className="text-3xl font-extrabold text-yellow-300">
          CONNECT 4 — {difficulty.toUpperCase()}
        </h1>

        <div className="text-xl text-yellow-200 font-semibold mb-2">
          Score: <span className="text-yellow-400">{score}</span>
        </div>

        {winner && (
          <div className="mt-1 bg-yellow-700/40 rounded-xl px-6 py-2 text-center text-xl font-bold text-yellow-300">
            {winner === PLAYER ? "🎉 You Win!" : "🤖 AI Wins!"}
          </div>
        )}

        <div className="flex mb-2 gap-2">
          {Array(COLS)
            .fill(null)
            .map((_, c) => (
              <div
                key={c}
                className="w-[9vh] h-8 flex justify-center items-center cursor-pointer"
                onMouseEnter={() => setHoveredCol(c)}
                onMouseLeave={() => setHoveredCol(null)}
                onClick={() => handleColumnClick(c)}
              >
                {currentPlayer === PLAYER && !winner && (
                  <div
                    className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] transition-all ${
                      hoveredCol === c
                        ? "border-t-red-500 animate-bounce"
                        : "border-t-red-400/40"
                    }`}
                  ></div>
                )}
              </div>
            ))}
        </div>

        <div className="bg-blue-600 rounded-xl p-4 shadow-2xl max-h-[70vh] flex flex-col justify-center">
          {board.map((row, rIdx) => (
            <div
              key={rIdx}
              className="flex gap-2 mb-2 last:mb-0 justify-center"
            >
              {row.map((cell, cIdx) => (
                <div
                  key={cIdx}
                  className="w-[9vh] h-[9vh] rounded-full bg-gray-900 flex items-center justify-center"
                >
                  {cell && (
                    <div
                      className="w-[8vh] h-[8vh] rounded-full transition-all duration-300"
                      style={{
                        background:
                          cell === PLAYER
                            ? "radial-gradient(circle at 30% 30%, #ff6b6b, #dc2626)"
                            : "radial-gradient(circle at 30% 30%, #60a5fa, #2563eb)",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={resetGame}
            className="px-5 py-2 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-500 shadow-lg"
          >
            Restart
          </button>
          <button
            onClick={endGame}
            className="px-5 py-2 bg-yellow-700/50 text-white font-bold rounded-lg border border-yellow-400 hover:bg-yellow-600/50"
          >
            End Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Connect4;
