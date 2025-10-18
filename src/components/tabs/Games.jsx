import React, { useState } from 'react';
import SnakeGame from '../games/SnakeGame';
import ReactionGame from '../games/ReactionGame';
import Connect4 from '../games/Connect4Game.jsx';
import CryptowordGame from '../games/CryptowordGame.jsx';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
        <h2 className="text-5xl font-bold mb-12 text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Choose Your Game
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
          {/* Snake Game */}
          <div 
            onClick={() => setActiveGame('snake')}
            className="bg-gradient-to-br from-green-900 to-emerald-900 p-8 rounded-2xl cursor-pointer hover:scale-105 transition-all border-2 border-green-500 hover:shadow-2xl hover:shadow-green-500/50"
          >
            <div className="text-6xl mb-4 text-center">🐍</div>
            <h3 className="text-3xl font-bold mb-4 text-green-400 text-center">SNAKE</h3>
            <p className="text-gray-300 mb-6 text-center">Classic arcade game</p>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Arrow keys to move
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Eat food to grow
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                Avoid walls & yourself
              </p>
            </div>
            <button className="w-full mt-6 px-6 py-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-all">
              PLAY NOW
            </button>
          </div>

          {/* Reaction Game */}
          <div 
            onClick={() => setActiveGame('reaction')}
            className="bg-gradient-to-br from-pink-900 to-purple-900 p-8 rounded-2xl cursor-pointer hover:scale-105 transition-all border-2 border-pink-500 hover:shadow-2xl hover:shadow-pink-500/50"
          >
            <div className="text-6xl mb-4 text-center">⚡</div>
            <h3 className="text-3xl font-bold mb-4 text-pink-400 text-center">REACTION</h3>
            <p className="text-gray-300 mb-6 text-center">Test your reflexes</p>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="flex items-center">
                <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                Wait for green light
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                Click as fast as you can
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                5 rounds to complete
              </p>
            </div>
            <button className="w-full mt-6 px-6 py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-400 transition-all">
              PLAY NOW
            </button>
          </div>

          {/* Connect 4 */}
          <div 
            onClick={() => setActiveGame('connect4')}
            className="bg-gradient-to-br from-red-900 to-blue-900 p-8 rounded-2xl cursor-pointer hover:scale-105 transition-all border-2 border-yellow-500 hover:shadow-2xl hover:shadow-yellow-500/50"
          >
            <div className="text-6xl mb-4 text-center">🔴</div>
            <h3 className="text-3xl font-bold mb-4 text-yellow-400 text-center">CONNECT 4</h3>
            <p className="text-gray-300 mb-6 text-center">Strategy board game</p>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                Drop discs in columns
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                Connect 4 in a row
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                Beat the AI opponent
              </p>
            </div>
            <button className="w-full mt-6 px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-all">
              PLAY NOW
            </button>
          </div>

          {/* Cryptoword */}
          <div 
            onClick={() => setActiveGame('cryptoword')}
            className="bg-gradient-to-br from-purple-900 to-indigo-900 p-8 rounded-2xl cursor-pointer hover:scale-105 transition-all border-2 border-purple-500 hover:shadow-2xl hover:shadow-purple-500/50"
          >
            <div className="text-6xl mb-4 text-center">🔐</div>
            <h3 className="text-3xl font-bold mb-4 text-purple-400 text-center">CRYPTOWORD</h3>
            <p className="text-gray-300 mb-6 text-center">Decode the puzzle</p>
            <div className="space-y-3 text-sm text-gray-400">
              <p className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                Decrypt hidden phrases
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                Use hints wisely
              </p>
              <p className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                50 challenging levels
              </p>
            </div>
            <button className="w-full mt-6 px-6 py-3 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-400 transition-all">
              PLAY NOW
            </button>
          </div>
        </div>

        {/* Detailed Rules Section */}
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold mb-10 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            How to Play
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Snake Game Rules */}
            <div className="bg-gray-800 p-8 rounded-2xl border-2 border-green-500/30 hover:border-green-500/60 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">🐍</div>
                <h4 className="text-3xl font-bold text-green-400">Snake Game</h4>
              </div>
              <div className="space-y-4 text-gray-300">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h5 className="font-bold text-green-400 mb-2">Controls:</h5>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      Use arrow keys (↑ ↓ ← →) to move
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      Can't reverse direction
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h5 className="font-bold text-green-400 mb-2">Objective:</h5>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      Eat red food to grow longer
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      Each food gives 10 points
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      Avoid hitting walls or yourself
                    </li>
                  </ul>
                </div>
                <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/30">
                  <p className="text-sm text-green-300">
                    <span className="font-bold">Tip:</span> Plan your path ahead to avoid trapping yourself!
                  </p>
                </div>
              </div>
            </div>

            {/* Reaction Game Rules */}
            <div className="bg-gray-800 p-8 rounded-2xl border-2 border-pink-500/30 hover:border-pink-500/60 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">⚡</div>
                <h4 className="text-3xl font-bold text-pink-400">Reaction Tester</h4>
              </div>
              <div className="space-y-4 text-gray-300">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h5 className="font-bold text-pink-400 mb-2">How to Play:</h5>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                      Wait for the red box to appear
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                      It will turn green after a delay
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                      Click as soon as it turns green
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h5 className="font-bold text-pink-400 mb-2">Scoring:</h5>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                      Faster reactions = higher score
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                      Complete 5 rounds total
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
                      Don't click too early!
                    </li>
                  </ul>
                </div>
                <div className="bg-pink-900/30 p-3 rounded-lg border border-pink-500/30">
                  <p className="text-sm text-pink-300">
                    <span className="font-bold">Tip:</span> Stay focused and keep your mouse ready!
                  </p>
                </div>
              </div>
            </div>

            {/* Connect 4 Rules */}
            <div className="bg-gray-800 p-8 rounded-2xl border-2 border-yellow-500/30 hover:border-yellow-500/60 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">🔴</div>
                <h4 className="text-3xl font-bold text-yellow-400">Connect 4</h4>
              </div>
              <div className="space-y-4 text-gray-300">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h5 className="font-bold text-yellow-400 mb-2">How to Play:</h5>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                      Click arrows above columns
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                      Your disc drops to lowest spot
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                      You play red, computer plays blue
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h5 className="font-bold text-yellow-400 mb-2">Win Conditions:</h5>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                      Connect 4 discs horizontally
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                      Connect 4 discs vertically
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                      Connect 4 discs diagonally
                    </li>
                  </ul>
                </div>
                <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-500/30">
                  <p className="text-sm text-yellow-300">
                    <span className="font-bold">Tip:</span> Block your opponent while building your own line!
                  </p>
                </div>
              </div>
            </div>

            {/* Cryptoword Rules */}
            <div className="bg-gray-800 p-8 rounded-2xl border-2 border-purple-500/30 hover:border-purple-500/60 transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">🔐</div>
                <h4 className="text-3xl font-bold text-purple-400">Cryptoword</h4>
              </div>
              <div className="space-y-4 text-gray-300">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h5 className="font-bold text-purple-400 mb-2">How to Play:</h5>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Each letter is substituted
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Type the decoded letter
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Use arrow keys to navigate
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h5 className="font-bold text-purple-400 mb-2">Scoring:</h5>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Start with 1000 points
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Hints cost 50 points each
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                      Bonus for quick solves
                    </li>
                  </ul>
                </div>
                <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/30">
                  <p className="text-sm text-purple-300">
                    <span className="font-bold">Tip:</span> Look for common words like THE and AND first!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-4xl font-bold text-white">
            {activeGame === 'snake' ? '🐍 SNAKE GAME' : 
             activeGame === 'reaction' ? '⚡ REACTION TESTER' :
             activeGame === 'connect4' ? '🔴 CONNECT 4' :
             '🔐 CRYPTOWORD'}
          </h2>
          <button 
            onClick={handleBackToGames}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all font-semibold flex items-center gap-2"
          >
            ← Back to Games
          </button>
        </div>
        
        <div className="flex justify-center">
          {activeGame === 'snake' && (
            <SnakeGame onGameOver={handleGameOver} />
          )}
          
          {activeGame === 'reaction' && (
            <ReactionGame onGameOver={handleGameOver} />
          )}

          {activeGame === 'connect4' && (
            <Connect4 onGameOver={handleGameOver} />
          )}

          {activeGame === 'cryptoword' && (
            <CryptowordGame onGameOver={handleGameOver} />
          )}
        </div>

        {showScoreModal && (
          <ScoreSubmitModal
            score={finalScore}
            game={activeGame}
            user={user}
            onClose={handleScoreSubmitted}
          />
        )}
      </div>
    </div>
  );
};

export default Games;