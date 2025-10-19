import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Award, Star } from "lucide-react";
import { getOfflineScores, getScores } from "../../services/firebaseService";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("online");
  const [selectedGame, setSelectedGame] = useState("snake");
  const [onlineScores, setOnlineScores] = useState([]);
  const [offlineScores, setOfflineScores] = useState([]);
  const [weightedScores, setWeightedScores] = useState([]);
  const [loading, setLoading] = useState(false);

  const games = [
    { key: "snake", label: "Snake", color: "green" },
    { key: "reaction", label: "Reaction Tester", color: "pink" },
    { key: "connect4", label: "Connect 4", color: "yellow" },
    { key: "cryptoword", label: "Cryptoword", color: "purple" },
  ];

  const multipliers = {
    snake: 2.0,
    reaction: 0.5,
    connect4: 1.0,
    cryptoword: 1.5,
  };

  // 🔹 Load Online Scores (per game)
  const loadOnlineScores = async (game) => {
    setLoading(true);
    try {
      const data = await getScores(game);
      setOnlineScores(data);
    } catch (error) {
      console.error("Error loading online scores:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load Offline Scores
  const loadOfflineScores = async () => {
    setLoading(true);
    try {
      const data = await getOfflineScores();
      setOfflineScores(data);
    } catch (error) {
      console.error("Error loading offline scores:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load Weighted Totals from all online leaderboards
  const loadWeightedTotals = async () => {
    setLoading(true);
    try {
      const allGameScores = [];

      for (const g of games) {
        const scores = await getScores(g.key);
        scores.forEach((s) =>
          allGameScores.push({
            name: s.name || s.username || "Unknown Player",
            score: s.score || 0,
            game: g.key,
          })
        );
      }

      const totals = {};
      allGameScores.forEach((s) => {
        const multiplier = multipliers[s.game] || 1;
        const weighted = s.score * multiplier;

        if (!totals[s.name]) {
          totals[s.name] = { name: s.name, total: 0, gamesPlayed: 0 };
        }

        totals[s.name].total += weighted;
        totals[s.name].gamesPlayed += 1;
      });

      const ranked = Object.values(totals).sort((a, b) => b.total - a.total);
      setWeightedScores(ranked);
    } catch (error) {
      console.error("Error computing weighted totals:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle tab switch
  useEffect(() => {
    if (activeTab === "online") loadOnlineScores(selectedGame);
    if (activeTab === "offline") loadOfflineScores();
    if (activeTab === "total") loadWeightedTotals();
  }, [activeTab, selectedGame]);

  // 🏆 Rank Icons
  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return (
          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
        );
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0:
        return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/50";
      case 1:
        return "from-gray-400/20 to-gray-500/20 border-gray-400/50";
      case 2:
        return "from-orange-500/20 to-orange-600/20 border-orange-500/50";
      default:
        return "from-gray-700/50 to-gray-800/50 border-gray-600/30";
    }
  };

  // 🧾 Render score cards
  const renderScoreCard = (score, index) => (
    <div
      key={score.id || `${score.name}-${index}`}
      className={`bg-gradient-to-r ${getRankColor(
        index
      )} p-6 rounded-xl border backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12">
            {getRankIcon(index)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{score.name}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-green-400">
            {score.score.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400 capitalize">
            {score.game || selectedGame}
          </p>
        </div>
      </div>
    </div>
  );

  const renderWeightedCard = (player, index) => (
    <div
      key={player.name}
      className={`bg-gradient-to-r ${getRankColor(
        index
      )} p-6 rounded-xl border flex justify-between items-center`}
    >
      <div className="flex items-center gap-4">
        {getRankIcon(index)}
        <div className="text-left">
          <h3 className="text-xl font-bold text-white">{player.name}</h3>
          <p className="text-sm text-gray-400">
            Games Played: {player.gamesPlayed}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-3xl font-bold text-green-400">
          {Math.round(player.total).toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">Weighted Points</p>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-4xl font-bold mb-8 text-center">Leaderboards</h2>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800 rounded-lg p-1 flex flex-wrap">
          <button
            onClick={() => setActiveTab("online")}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === "online"
                ? "bg-green-500 text-black"
                : "text-green-400 hover:bg-green-500/20"
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setActiveTab("offline")}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === "offline"
                ? "bg-purple-500 text-white"
                : "text-purple-400 hover:bg-purple-500/20"
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab("total")}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === "total"
                ? "bg-yellow-500 text-black"
                : "text-yellow-400 hover:bg-yellow-500/20"
            }`}
          >
            Total Points
          </button>
        </div>
      </div>

      {/* Game Selection */}
      {activeTab === "online" && (
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

      {/* Leaderboard Display */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading leaderboard...</p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {activeTab === "online" &&
              onlineScores.map((score, i) => renderScoreCard(score, i))}
            {activeTab === "offline" &&
              offlineScores.map((score, i) => renderScoreCard(score, i))}
            {activeTab === "total" &&
              weightedScores.map((p, i) => renderWeightedCard(p, i))}

            {/* Empty state */}
            {((activeTab === "online" && onlineScores.length === 0) ||
              (activeTab === "offline" && offlineScores.length === 0) ||
              (activeTab === "total" && weightedScores.length === 0)) && (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {activeTab === "total"
                    ? "No weighted data yet"
                    : activeTab === "online"
                    ? `No scores yet for ${selectedGame}`
                    : "No event scores yet"}
                </p>
                <p className="text-gray-500 mt-2">
                  Be the first to set a record!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multipliers */}
      {activeTab === "total" && (
        <div className="mt-12 bg-gray-800/60 rounded-xl p-6 border border-gray-700">
          <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
            <Star className="text-yellow-400" /> Game Multipliers
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-900 p-3 rounded-lg border border-green-500/30">
              <p className="font-semibold text-green-400">Snake</p>
              <p className="text-sm text-gray-400">×2.0</p>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg border border-pink-500/30">
              <p className="font-semibold text-pink-400">Reaction Tester</p>
              <p className="text-sm text-gray-400">×0.5</p>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg border border-yellow-500/30">
              <p className="font-semibold text-yellow-400">Connect 4</p>
              <p className="text-sm text-gray-400">×1.0</p>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg border border-purple-500/30">
              <p className="font-semibold text-purple-400">Cryptoword</p>
              <p className="text-sm text-gray-400">×1.5</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
