import React, { useState } from 'react';
import SnakeGame from '../games/SnakeGame';
import ReactionGame from '../games/ReactionGame';
import ScoreSubmitModal from '../modals/ScoreSubmitModal';

const Games = ({ user }) => {
  const [activeGame, setActiveGame] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const handleGameOver = (score) => {
    setFinalScore(score);
    setShowScoreModal(true);
  };

  const handleScoreSubmitted = () => {
    setShowScoreModal(false);
    setActiveGame(null);
  };

  const handleBackToGames = () => {
    setActiveGame(null);
  };

  if (!activeGame) {
    return (
      <div>
        <h2 className="text-4xl font-bold mb-8 text-center">Choose Your Game</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div 
            onClick={() => setActiveGame('snake')}
            className="bg-gradient-to-br from-green-900 to-emerald-900 p-10 rounded-2xl cursor-pointer hover:scale-105 transition-all border-2 border-green-500 hover:shadow-lg hover:shadow-green-500/50"
          >
            <h3 className="text-4xl font-bold mb-6 text-green-400">SNAKE GAME</h3>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">Classic snake game. Eat food, grow longer, don't hit yourself!</p>
            <div className="space-y-6">
              <div className="text-gray-400 space-y-2">
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Use arrow keys to control
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Eat red food to grow
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Avoid walls and yourself
                </p>
              </div>
              <button className="w-full px-8 py-4 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-all text-lg">
                PLAY NOW
              </button>
            </div>
          </div>
          
          <div 
            onClick={() => setActiveGame('reaction')}
            className="bg-gradient-to-br from-pink-900 to-purple-900 p-10 rounded-2xl cursor-pointer hover:scale-105 transition-all border-2 border-pink-500 hover:shadow-lg hover:shadow-pink-500/50"
          >
            <h3 className="text-4xl font-bold mb-6 text-pink-400">REACTION TESTER</h3>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">Test your reflexes! Click when green. Fast reactions = high score!</p>
            <div className="space-y-6">
              <div className="text-gray-400 space-y-2">
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                  Wait for red box
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                  Click when it turns green
                </p>
                <p className="flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                  5 rounds total
                </p>
              </div>
              <button className="w-full px-8 py-4 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-400 transition-all text-lg">
                PLAY NOW
              </button>
            </div>
          </div>
        </div>

        <div className="mt-20 bg-gradient-to-r from-gray-800 to-gray-900 p-10 rounded-2xl border border-blue-500/30 max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-blue-400 text-center">Game Rules</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-3">
                <span className="text-3xl">🐍</span>
                Snake Game
              </h4>
              <ul className="text-gray-300 space-y-3 text-lg">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-4"></span>
                  Use arrow keys to move the snake
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-4"></span>
                  Eat red food to grow and score points
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-4"></span>
                  Avoid hitting walls or your own body
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-4"></span>
                  Each food gives you 10 points
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-2xl font-bold text-pink-400 mb-4 flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                Reaction Tester
              </h4>
              <ul className="text-gray-300 space-y-3 text-lg">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-4"></span>
                  Wait for the red box to turn green
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-4"></span>
                  Click as fast as possible when green
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-4"></span>
                  Don't click too early or you'll fail
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-4"></span>
                  Score based on reaction time
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold mb-8">
        {activeGame === 'snake' ? 'SNAKE GAME' : 'REACTION TESTER'}
      </h2>
      
      {activeGame === 'snake' && (
        <SnakeGame onGameOver={handleGameOver} />
      )}
      
      {activeGame === 'reaction' && (
        <div className="flex justify-center">
          <ReactionGame onGameOver={handleGameOver} />
        </div>
      )}
      
      <button 
        onClick={handleBackToGames}
        className="mt-8 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
      >
        ← Back to Games
      </button>

      {showScoreModal && (
        <ScoreSubmitModal
          score={finalScore}
          game={activeGame}
          user={user}
          onClose={handleScoreSubmitted}
        />
      )}
    </div>
  );
};

export default Games;
