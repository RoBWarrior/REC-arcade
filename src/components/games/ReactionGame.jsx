import React, { useState, useRef } from 'react';

const ReactionGame = ({ onGameOver }) => {
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const startTimeRef = useRef(0);

  const startGame = () => {
    setScore(0);
    setRound(0);
    startRound();
  };

  const startRound = () => {
    setGameState('waiting');
    const delay = Math.random() * 3000 + 1000;
    
    setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'ready') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      const points = Math.max(1000 - time, 0);
      setScore(s => s + points);
      
      if (round < 4) {
        setRound(r => r + 1);
        setTimeout(startRound, 1500);
      } else {
        setGameState('finished');
        onGameOver(score + points);
      }
    } else if (gameState === 'waiting') {
      setGameState('failed');
      onGameOver(score);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {gameState === 'idle' && (
        <div className="text-center">
          <button 
            onClick={startGame}
            className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-lg hover:from-pink-400 hover:to-purple-400 transition-all"
          >
            START GAME
          </button>
          <p className="text-gray-400 mt-4 font-mono text-sm">
            Click when the box turns GREEN!
          </p>
        </div>
      )}
      
      {(gameState === 'waiting' || gameState === 'ready') && (
        <div 
          onClick={handleClick}
          className={`w-full h-64 rounded-lg cursor-pointer transition-all flex items-center justify-center text-2xl font-bold ${
            gameState === 'waiting' 
              ? 'bg-red-900 text-red-400' 
              : 'bg-green-500 text-black animate-pulse'
          }`}
        >
          {gameState === 'waiting' ? 'WAIT...' : 'CLICK NOW!'}
        </div>
      )}

      {gameState === 'failed' && (
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-4">TOO EARLY!</div>
          <p className="text-white">Final Score: {score}</p>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="text-center">
          <div className="text-green-500 text-xl font-bold mb-4">COMPLETE!</div>
          <p className="text-white">Final Score: {score}</p>
        </div>
      )}

      {(gameState === 'waiting' || gameState === 'ready') && (
        <div className="text-center">
          <p className="text-white font-mono">Round: {round + 1}/5</p>
          <p className="text-green-400 font-mono">Score: {score}</p>
          {reactionTime > 0 && <p className="text-blue-400 font-mono">Last: {reactionTime}ms</p>}
        </div>
      )}
    </div>
  );
};

export default ReactionGame;