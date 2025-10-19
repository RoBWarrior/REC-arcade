import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Award } from 'lucide-react';
import { getScores, getOfflineScores } from '../../services/firebaseService';

const Leaderboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('online');
  const [selectedGame, setSelectedGame] = useState('snake');
  const [onlineScores, setOnlineScores] = useState([]);
  const [offlineScores, setOfflineScores] = useState([]);
  const [loading, setLoading] = useState(false);

  const games = [
    { key: 'snake', label: 'Snake', color: 'green' },
    { key: 'reaction', label: 'Reaction Tester', color: 'pink' },
    { key: 'connect4', label: 'Connect 4', color: 'yellow' },
    { key: 'cryptoword', label: 'Cryptoword', color: 'purple' },
  ];

  const loadOnlineScores = async (game) => {
    setLoading(true);
    try {
      const scores = await getScores(game);
      setOnlineScores(scores);
    } catch (error) {
      console.error('Error loading online scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOfflineScores = async () => {
    setLoading(true);
    try {
      const scores = await getOfflineScores();
      setOfflineScores(scores);
    } catch (error) {
      console.error('Error loading offline scores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'online') loadOnlineScores(selectedGame);
    else loadOfflineScores();
  }, [activeTab, selectedGame]);

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{index + 1}</span>;
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 1:
        return 'from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 2:
        return 'from-orange-500/20 to-orange-600/20 border-orange-500/50';
      default:
        return 'from-gray-700/50 to-gray-800/50 border-gray-600/30';
    }
  };

  const renderScoreCard = (score, index) => (
    <div
      key={score.id || `${score.name}-${index}`}
      className={`bg-gradient-to-r ${getRankColor(index)} p-6 rounded-xl border backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12">
            {getRankIcon(index)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{score.name}</h3>
            <p className="text-sm text-gray-500">
              {score.timestamp?.toDate
                ? score.timestamp.toDate().toLocaleDateString()
                : new Date(score.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-green-400">{score.score.toLocaleString()}</p>
          <p className="text-sm text-gray-400 capitalize">{score.game || selectedGame}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8 text-center">Leaderboards</h2>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800 rounded-lg p-1 flex flex-wrap">
          <button
            onClick={() => setActiveTab('online')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'online'
                ? 'bg-green-500 text-black'
                : 'text-green-400 hover:bg-green-500/20'
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setActiveTab('offline')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'offline'
                ? 'bg-purple-500 text-white'
                : 'text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            Events
          </button>
        </div>
      </div>

      {/* Game Selection for Online Tab */}
      {activeTab === 'online' && (
        <div className="flex justify-center mb-8 flex-wrap gap-2">
          <div className="bg-gray-800 rounded-lg p-1 flex flex-wrap justify-center gap-2">
            {games.map((game) => (
              <button
                key={game.key}
                onClick={() => setSelectedGame(game.key)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  selectedGame === game.key
                    ? `bg-${game.color}-500 text-black`
                    : `text-${game.color}-400 hover:bg-${game.color}-500/20`
                }`}
              >
                {game.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading leaderboard...</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {(activeTab === 'online' ? onlineScores : offlineScores).map((score, index) =>
              renderScoreCard(score, index)
            )}

            {(activeTab === 'online' ? onlineScores : offlineScores).length === 0 && (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {activeTab === 'online'
                    ? `No scores yet for ${selectedGame} game`
                    : 'No offline event scores recorded yet'}
                </p>
                <p className="text-gray-500 mt-2">Be the first to set a record!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
