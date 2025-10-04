import React, { useState, useEffect, useRef } from 'react';

const SnakeGame = ({ onGameOver }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const gameStateRef = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: { x: 1, y: 0 },
    gameOver: false
  });

  useEffect(() => {
    if (!gameStarted) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    const gameLoop = setInterval(() => {
      const state = gameStateRef.current;
      if (state.gameOver) return;

      const head = { 
        x: state.snake[0].x + state.direction.x, 
        y: state.snake[0].y + state.direction.y 
      };

      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        state.gameOver = true;
        onGameOver(score);
        return;
      }

      if (state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        state.gameOver = true;
        onGameOver(score);
        return;
      }

      state.snake.unshift(head);

      if (head.x === state.food.x && head.y === state.food.y) {
        setScore(s => s + 10);
        state.food = {
          x: Math.floor(Math.random() * tileCount),
          y: Math.floor(Math.random() * tileCount)
        };
      } else {
        state.snake.pop();
      }

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      state.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#00ff88' : '#00cc66';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
      });

      ctx.fillStyle = '#ff0066';
      ctx.fillRect(state.food.x * gridSize, state.food.y * gridSize, gridSize - 2, gridSize - 2);

      ctx.fillStyle = '#00ff88';
      ctx.font = '16px "Courier New"';
      ctx.fillText(`SCORE: ${score}`, 10, 20);
    }, 100);

    const handleKeyPress = (e) => {
      const state = gameStateRef.current;
      const key = e.key;
      
      if (key === 'ArrowUp' && state.direction.y === 0) {
        state.direction = { x: 0, y: -1 };
      } else if (key === 'ArrowDown' && state.direction.y === 0) {
        state.direction = { x: 0, y: 1 };
      } else if (key === 'ArrowLeft' && state.direction.x === 0) {
        state.direction = { x: -1, y: 0 };
      } else if (key === 'ArrowRight' && state.direction.x === 0) {
        state.direction = { x: 1, y: 0 };
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameStarted, score, onGameOver]);

  const startGame = () => {
    setScore(0);
    gameStateRef.current = {
      snake: [{ x: 10, y: 10 }],
      food: { x: 15, y: 15 },
      direction: { x: 1, y: 0 },
      gameOver: false
    };
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!gameStarted ? (
        <button 
          onClick={startGame}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold rounded-lg hover:from-green-400 hover:to-emerald-400 transition-all"
        >
          START GAME
        </button>
      ) : (
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400}
          className="border-4 border-green-500 rounded-lg shadow-lg shadow-green-500/50"
        />
      )}
      <p className="text-green-400 font-mono">Use Arrow Keys to Control</p>
    </div>
  );
};

export default SnakeGame;