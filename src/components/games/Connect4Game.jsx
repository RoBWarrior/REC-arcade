import React, { useState, useEffect } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';

const ROWS = 6;
const COLS = 7;
const PLAYER = 'red';
const COMPUTER = 'blue';

const Connect4 = ({ onGameOver }) => {
  const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hoveredCol, setHoveredCol] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [isComputerThinking, setIsComputerThinking] = useState(false);

  useEffect(() => {
    if (currentPlayer === COMPUTER && !winner && !isComputerThinking) {
      setIsComputerThinking(true);
      setTimeout(() => {
        makeComputerMove();
        setIsComputerThinking(false);
      }, 500);
    }
  }, [currentPlayer, winner]);

  // Trigger score submission when game ends
  useEffect(() => {
    if (!winner) return;
    try {
      const humanMoves = history.filter(h => h.player === PLAYER).length;
      const base = 600;
      const difficultyBonus = difficulty === 'hard' ? 300 : difficulty === 'medium' ? 150 : 0;
      const outcomeBonus = winner === PLAYER ? 400 : 0;
      const penalty = humanMoves * 15;
      const finalScore = Math.max(0, base + difficultyBonus + outcomeBonus - penalty);
      if (typeof onGameOver === 'function') {
        onGameOver(finalScore);
      }
    } catch (_) {
      // ignore scoring errors
    }
  }, [winner]);

  const checkWinner = (board) => {
    // Check horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (board[row][col] && 
            board[row][col] === board[row][col + 1] &&
            board[row][col] === board[row][col + 2] &&
            board[row][col] === board[row][col + 3]) {
          return {
            winner: board[row][col],
            cells: [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]]
          };
        }
      }
    }

    // Check vertical
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col] && 
            board[row][col] === board[row + 1][col] &&
            board[row][col] === board[row + 2][col] &&
            board[row][col] === board[row + 3][col]) {
          return {
            winner: board[row][col],
            cells: [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]]
          };
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        if (board[row][col] && 
            board[row][col] === board[row + 1][col + 1] &&
            board[row][col] === board[row + 2][col + 2] &&
            board[row][col] === board[row + 3][col + 3]) {
          return {
            winner: board[row][col],
            cells: [[row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]]
          };
        }
      }
    }

    // Check diagonal (down-left)
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 3; col < COLS; col++) {
        if (board[row][col] && 
            board[row][col] === board[row + 1][col - 1] &&
            board[row][col] === board[row + 2][col - 2] &&
            board[row][col] === board[row + 3][col - 3]) {
          return {
            winner: board[row][col],
            cells: [[row, col], [row + 1, col - 1], [row + 2, col - 2], [row + 3, col - 3]]
          };
        }
      }
    }

    return null;
  };

  const getLowestRow = (board, col) => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (!board[row][col]) return row;
    }
    return -1;
  };

  const isValidMove = (board, col) => {
    return col >= 0 && col < COLS && board[0][col] === null;
  };

  const makeMove = (board, col, player) => {
    const row = getLowestRow(board, col);
    if (row === -1) return null;
    
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = player;
    return newBoard;
  };

  const evaluateWindow = (window, player) => {
    let score = 0;
    const opponent = player === PLAYER ? COMPUTER : PLAYER;
    
    const playerCount = window.filter(c => c === player).length;
    const opponentCount = window.filter(c => c === opponent).length;
    const emptyCount = window.filter(c => c === null).length;

    if (playerCount === 4) score += 100;
    else if (playerCount === 3 && emptyCount === 1) score += 5;
    else if (playerCount === 2 && emptyCount === 2) score += 2;

    if (opponentCount === 3 && emptyCount === 1) score -= 4;

    return score;
  };

  const scorePosition = (board, player) => {
    let score = 0;

    // Score center column
    const centerArray = board.map(row => row[3]);
    const centerCount = centerArray.filter(c => c === player).length;
    score += centerCount * 3;

    // Score horizontal
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const window = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]];
        score += evaluateWindow(window, player);
      }
    }

    // Score vertical
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS - 3; row++) {
        const window = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
        score += evaluateWindow(window, player);
      }
    }

    // Score diagonal
    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 0; col < COLS - 3; col++) {
        const window = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
        score += evaluateWindow(window, player);
      }
    }

    for (let row = 0; row < ROWS - 3; row++) {
      for (let col = 3; col < COLS; col++) {
        const window = [board[row][col], board[row + 1][col - 1], board[row + 2][col - 2], board[row + 3][col - 3]];
        score += evaluateWindow(window, player);
      }
    }

    return score;
  };

  const minimax = (board, depth, alpha, beta, maximizingPlayer) => {
    const validMoves = [];
    for (let col = 0; col < COLS; col++) {
      if (isValidMove(board, col)) validMoves.push(col);
    }

    const result = checkWinner(board);
    if (result) {
      if (result.winner === COMPUTER) return [null, 100000];
      else return [null, -100000];
    } else if (validMoves.length === 0) {
      return [null, 0];
    } else if (depth === 0) {
      return [null, scorePosition(board, COMPUTER)];
    }

    if (maximizingPlayer) {
      let value = -Infinity;
      let column = validMoves[0];
      for (let col of validMoves) {
        const newBoard = makeMove(board, col, COMPUTER);
        const newScore = minimax(newBoard, depth - 1, alpha, beta, false)[1];
        if (newScore > value) {
          value = newScore;
          column = col;
        }
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break;
      }
      return [column, value];
    } else {
      let value = Infinity;
      let column = validMoves[0];
      for (let col of validMoves) {
        const newBoard = makeMove(board, col, PLAYER);
        const newScore = minimax(newBoard, depth - 1, alpha, beta, true)[1];
        if (newScore < value) {
          value = newScore;
          column = col;
        }
        beta = Math.min(beta, value);
        if (alpha >= beta) break;
      }
      return [column, value];
    }
  };

  const makeComputerMove = () => {
    const validMoves = [];
    for (let col = 0; col < COLS; col++) {
      if (isValidMove(board, col)) validMoves.push(col);
    }

    if (validMoves.length === 0) return;

    let col;
    if (difficulty === 'easy') {
      col = validMoves[Math.floor(Math.random() * validMoves.length)];
    } else if (difficulty === 'medium') {
      if (Math.random() < 0.5) {
        col = minimax(board, 3, -Infinity, Infinity, true)[0];
      } else {
        col = validMoves[Math.floor(Math.random() * validMoves.length)];
      }
    } else {
      col = minimax(board, 4, -Infinity, Infinity, true)[0];
    }

    handleColumnClick(col, true);
  };

  const handleColumnClick = (col, byComputer = false) => {
    if (winner || (!byComputer && currentPlayer === COMPUTER) || !isValidMove(board, col)) return;

    const row = getLowestRow(board, col);
    if (row === -1) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ board: newBoard, player: currentPlayer });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningCells(result.cells);
    } else {
      setCurrentPlayer(currentPlayer === PLAYER ? COMPUTER : PLAYER);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 2;
      if (newIndex >= 0) {
        const state = history[newIndex];
        setBoard(state.board);
        setCurrentPlayer(PLAYER);
        setHistoryIndex(newIndex);
        setWinner(null);
        setWinningCells([]);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 2;
      if (newIndex < history.length) {
        const state = history[newIndex];
        setBoard(state.board);
        setCurrentPlayer(PLAYER);
        setHistoryIndex(newIndex);
        
        const result = checkWinner(state.board);
        if (result) {
          setWinner(result.winner);
          setWinningCells(result.cells);
        }
      }
    }
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer(PLAYER);
    setWinner(null);
    setWinningCells([]);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const isCellWinning = (row, col) => {
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-red-600 mb-8" style={{ fontFamily: 'Georgia, serif' }}>
          Connect 4
        </h1>

        <div className="flex gap-8">
          <div className="relative">
            <div className="bg-gray-300 p-4 rounded-lg shadow-2xl" style={{ width: 'fit-content' }}>
              {/* Arrows */}
              <div className="flex mb-2">
                {Array(COLS).fill(null).map((_, col) => (
                  <div
                    key={col}
                    className="w-20 h-12 flex items-center justify-center cursor-pointer"
                    onMouseEnter={() => setHoveredCol(col)}
                    onMouseLeave={() => setHoveredCol(null)}
                    onClick={() => handleColumnClick(col)}
                  >
                    {hoveredCol === col && !winner && currentPlayer === PLAYER && isValidMove(board, col) && (
                      <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[25px] border-t-gray-400" />
                    )}
                  </div>
                ))}
              </div>

              {/* Board */}
              <div className="bg-gradient-to-b from-gray-400 to-gray-500 p-3 rounded-lg">
                {board.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-2 mb-2 last:mb-0">
                    {row.map((cell, colIndex) => (
                      <div
                        key={colIndex}
                        className="w-20 h-20 rounded-full flex items-center justify-center relative"
                        style={{
                          background: 'linear-gradient(145deg, #e0e0e0, #a8a8a8)',
                          boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3)'
                        }}
                      >
                        {cell && (
                          <div
                            className="w-16 h-16 rounded-full transition-all duration-300"
                            style={{
                              background: cell === 'red' 
                                ? isCellWinning(rowIndex, colIndex)
                                  ? 'radial-gradient(circle at 30% 30%, #ff6b6b, #cc0000)'
                                  : 'radial-gradient(circle at 30% 30%, #ff4444, #cc0000)'
                                : isCellWinning(rowIndex, colIndex)
                                  ? 'radial-gradient(circle at 30% 30%, #66b3ff, #0066cc)'
                                  : 'radial-gradient(circle at 30% 30%, #4488ff, #0066cc)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                              border: isCellWinning(rowIndex, colIndex) ? '3px solid yellow' : 'none'
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-orange-100 p-4 rounded-lg border-2 border-orange-300">
              <p className="text-orange-600 font-semibold text-lg">Click Top Arrows</p>
              <p className="text-orange-600 font-semibold text-lg">to Drop Coins</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-semibold">You:</span>
              <div className="w-8 h-8 rounded-full" style={{ background: 'radial-gradient(circle at 30% 30%, #ff4444, #cc0000)' }} />
              <span className="font-semibold ml-4">Computer:</span>
              <div className="w-8 h-8 rounded-full" style={{ background: 'radial-gradient(circle at 30% 30%, #4488ff, #0066cc)' }} />
            </div>

            {winner && (
              <div className="bg-white p-6 rounded-lg border-2 border-gray-300 text-center">
                <h2 className="text-2xl font-bold mb-2">
                  {winner === PLAYER ? 'You Won!' : 'Computer Won'}
                </h2>
                <div className="text-6xl mb-4">
                  {winner === PLAYER ? '😊' : '😮'}
                </div>
                <p className="text-orange-600 font-semibold">
                  {winner === PLAYER ? 'Great job!' : 'Oops... Play again?'}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 rounded font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 rounded font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RotateCw size={18} />
                Redo
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold">Difficulty:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded font-semibold"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <button
              onClick={resetGame}
              className="w-full px-6 py-3 bg-white border-2 border-gray-300 rounded font-semibold text-lg hover:bg-gray-50"
            >
              Start a New Game
            </button>

            <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
              <h3 className="font-bold mb-2">How to Play...</h3>
              <ul className="text-sm space-y-1">
                <li>• Click arrows to drop your disc</li>
                <li>• Connect 4 in a row to win</li>
                <li>• Block opponent's progress</li>
                <li>• Win horizontally, vertically, or diagonally</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect4;