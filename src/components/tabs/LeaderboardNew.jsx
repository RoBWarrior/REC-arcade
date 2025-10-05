import React, { useState, useEffect } from 'react';
import { Trophy, Users, Medal, Crown, Award, Filter, Target } from 'lucide-react';
import { 
  getScores, 
  getOfflineScores, 
  getScoresByTrack, 
  getAllTracksLeaderboard 
} from '../../services/firebaseService';
import { getAllTracks, getTrackDisplayName } from '../../services/trackService';

const Leaderboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('online');
  const [selectedGame, setSelectedGame] = useState('snake');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [onlineScores, setOnlineScores] = useState([]);
  const [offlineScores, setOfflineScores] = useState([]);
  const [trackLeaderboards, setTrackLeaderboards] = useState({});
  const [availableTracks, setAvailableTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load available tracks
  useEffect(() => {
    const loadTracks = async () => {
      try {
        const tracks = await getAllTracks();
        setAvailableTracks(tracks);
        
        // Set user's track as default if they have one
        if (user?.track && selectedTrack === 'all') {
          setSelectedTrack(user.track);
        }
      } catch (error) {
        console.error('Error loading tracks:', error);
      }
    };

    loadTracks();
  }, [user?.track]);

  const loadOnlineScores = async (game, track = 'all') => {
    setLoading(true);
    try {
      if (track === 'all') {
        if (activeTab === 'tracks') {
          const trackLeaderboards = await getAllTracksLeaderboard(game);
          setTrackLeaderboards(trackLeaderboards);
        } else {
          const scores = await getScores(game);
          setOnlineScores(scores);
        }
      } else {
        const scores = await getScoresByTrack(game, track);
        setOnlineScores(scores);
      }
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
      loadOnlineScores(selectedGame, selectedTrack);
    } else if (activeTab === 'tracks') {
      loadOnlineScores(selectedGame, 'all');
    } else {
      loadOfflineScores();
    }
  }, [activeTab, selectedGame, selectedTrack]);

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
            {score.userTrack && (
              <p className="text-sm text-gray-400">
                {getTrackDisplayName(score.userTrack)}
              </p>
            )}
            <p className="text-sm text-gray-500">
              {score.timestamp?.toDate ? 
                score.timestamp.toDate().toLocaleDateString() : 
                new Date(score.timestamp).toLocaleDateString()
              }
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

  const renderTrackLeaderboards = () => (
    <div className="space-y-8">
      {Object.entries(trackLeaderboards).map(([trackCode, scores]) => (
        <div key={trackCode} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-2xl font-bold mb-4 text-center">
            <Target className="w-6 h-6 inline mr-2 text-blue-400" />
            {getTrackDisplayName(trackCode)}
          </h3>
          <div className="space-y-4">
            {scores.slice(0, 5).map((score, index) => renderScoreCard(score, index))}
          </div>
          {scores.length === 0 && (
            <p className="text-gray-400 text-center py-8">No scores yet for this track</p>
          )}
        </div>
      ))}
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
            onClick={() => setActiveTab('tracks')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === 'tracks' 
                ? 'bg-blue-500 text-white' 
                : 'text-blue-400 hover:bg-blue-500/20'
            }`}
          >
            By Track
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

      {/* Filters for online games */}
      {(activeTab === 'online' || activeTab === 'tracks') && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          {/* Game Selection */}
          <div className="flex justify-center">
            <div className="bg-gray-800 rounded-lg p-1 flex">
              <button
                onClick={() => setSelectedGame('snake')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  selectedGame === 'snake' 
                    ? 'bg-green-500 text-black' 
                    : 'text-green-400 hover:bg-green-500/20'
                }`}
              >
                Snake
              </button>
              <button
                onClick={() => setSelectedGame('reaction')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  selectedGame === 'reaction' 
                    ? 'bg-pink-500 text-white' 
                    : 'text-pink-400 hover:bg-pink-500/20'
                }`}
              >
                Reaction
              </button>
            </div>
          </div>

          {/* Track Selection (only for online tab) */}
          {activeTab === 'online' && availableTracks.length > 0 && (
            <div className="flex justify-center">
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tracks</option>
                {availableTracks.map(track => (
                  <option key={track.id} value={track.code}>
                    {track.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading leaderboard...</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {activeTab === 'tracks' ? (
            renderTrackLeaderboards()
          ) : (
            <div className="space-y-4">
              {(activeTab === 'online' ? onlineScores : offlineScores).map((score, index) => 
                renderScoreCard(score, index)
              )}
              
              {(activeTab === 'online' ? onlineScores : offlineScores).length === 0 && (
                <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
                  <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">
                    {activeTab === 'online' 
                      ? `No scores yet for ${selectedGame} game${selectedTrack !== 'all' ? ` in ${getTrackDisplayName(selectedTrack)}` : ''}`
                      : 'No offline event scores recorded yet'
                    }
                  </p>
                  <p className="text-gray-500 mt-2">Be the first to set a record!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;