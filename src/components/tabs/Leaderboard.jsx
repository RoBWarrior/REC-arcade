import React, { useState, useEffect } from 'react';
import { Trophy, Users, Medal, Crown, Award } from 'lucide-react';
import { getScores, getOfflineScores } from '../../services/firebaseService';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('online');
  const [selectedGame, setSelectedGame] = useState('snake');
  const [onlineScores, setOnlineScores] = useState([]);
  const [offlineScores, setOfflineScores] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOnlineScores = async (game) => {
    setLoading(true);
    try {
      const scores = await getScores(game);
      setOnlineScores(scores);
    } catch (error) {
      console.error('Error loading scores:', error);
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
    if (activeTab === 'online') {
      loadOnlineScores(selectedGame);
    } else {
      loadOfflineScores();
    }
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

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8 text-center">Leaderboards</h2>
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800 rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab('online')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'online' 
                ? 'bg-green-500 text-black' 
                : 'text-green-400 hover:bg-green-500/20'
            }`}
          >
            Online Games
          </button>
          <button
            onClick={() => setActiveTab('offline')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'offline' 
                ? 'bg-blue-500 text-white' 
                : 'text-blue-400 hover:bg-blue-500/20'
            }`}
          >
            Offline Events
          </button>
        </div>
      </div>

      {activeTab === 'online' && (
        <>
          {/* Game Selection */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setSelectedGame('snake')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                selectedGame === 'snake' 
                  ? 'bg-green-500 text-black' 
                  : 'bg-gray-700 text-green-400 hover:bg-green-500/20'
              }`}
            >
              Snake Game
            </button>
            <button
              onClick={() => setSelectedGame('reaction')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                selectedGame === 'reaction' 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-gray-700 text-pink-400 hover:bg-pink-500/20'
              }`}
            >
              Reaction Tester
            </button>
          </div>

          {/* Online Leaderboard */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-xl border border-green-500/30">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-400" />
                {selectedGame === 'snake' ? 'Snake Game' : 'Reaction Tester'} Leaderboard
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {onlineScores.map((entry, index) => (
                    <div 
                      key={entry.id || index}
                      className={`bg-gradient-to-r p-4 rounded-lg border flex items-center justify-between transition-all hover:scale-105 ${getRankColor(index)}`}
                    >
                      <div className="flex items-center gap-4">
                        {getRankIcon(index)}
                        <div>
                          <div className="font-bold text-white">{entry.name}</div>
                          {entry.timestamp && (
                            <div className="text-sm text-gray-400">
                              {new Date(entry.timestamp.toDate ? entry.timestamp.toDate() : entry.timestamp).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-yellow-400">{entry.score}</div>
                        <div className="text-sm text-gray-400">points</div>
                      </div>
                    </div>
                  ))}
                  
                  {onlineScores.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">No scores yet</p>
                      <p className="text-gray-500">Be the first to play and set a high score!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'offline' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 p-6 rounded-xl border border-blue-500/30">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="text-blue-400" />
              Offline Events Leaderboard
            </h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {offlineScores.map((entry, index) => (
                  <div 
                    key={entry.id || index}
                    className={`bg-gradient-to-r p-4 rounded-lg border flex items-center justify-between transition-all hover:scale-105 ${getRankColor(index)}`}
                  >
                    <div className="flex items-center gap-4">
                      {getRankIcon(index)}
                      <div>
                        <div className="font-bold text-white">{entry.name}</div>
                        <div className="text-sm text-blue-400">{entry.game}</div>
                        {entry.timestamp && (
                          <div className="text-sm text-gray-400">
                            {new Date(entry.timestamp.toDate ? entry.timestamp.toDate() : entry.timestamp).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-400">{entry.score}</div>
                      <div className="text-sm text-gray-400">points</div>
                    </div>
                  </div>
                ))}
                
                {offlineScores.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No offline scores yet</p>
                    <p className="text-gray-500">Scores from offline events will appear here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
