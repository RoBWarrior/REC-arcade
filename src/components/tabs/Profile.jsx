import React, { useState, useEffect } from 'react';
import {
  User,
  Trophy,
  Gamepad2,
  Calendar,
  Award,
  Target,
  Star,
  Zap,
  Crown,
  Medal,
} from 'lucide-react';
import { listenToUserScores } from '../../services/firebaseService';

const Profile = ({ user }) => {
  const [userScores, setUserScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    averageScore: 0,
    rank: 'Rookie',
    bestSnakeScore: 0,
    bestReactionScore: 0,
    bestConnect4Score: 0,
    bestCryptowordScore: 0,
  });

  // 🔹 Normalize game names (handles SnakeGame / snake etc.)
  const normalizeGame = (g) => g?.toLowerCase().replace('game', '').trim();

  // 🔹 Calculate stats dynamically from scores
  const processUserScores = (scores) => {
    const normalized = scores.map((s) => ({
      ...s,
      game: normalizeGame(s.gameType || s.game),
    }));

    // Group scores by game
    const grouped = normalized.reduce((acc, s) => {
      if (!acc[s.game]) acc[s.game] = [];
      acc[s.game].push(s.score);
      return acc;
    }, {});

    // Find best scores for each game
    const bestScores = Object.fromEntries(
      Object.entries(grouped).map(([g, arr]) => [g, Math.max(...arr)])
    );

    // Total games and average
    const totalGames = normalized.length;
    const totalScore = normalized.reduce((sum, s) => sum + s.score, 0);
    const avg = totalGames ? totalScore / totalGames : 0;

    // Determine rank
    let rank = 'Rookie';
    if (totalGames >= 10 && avg > 2000) rank = 'Expert';
    else if (totalGames >= 5 && avg > 1000) rank = 'Advanced';
    else if (totalGames >= 2) rank = 'Intermediate';

    setStats({
      totalGames,
      averageScore: Math.round(avg),
      rank,
      bestSnakeScore: bestScores.snake || 0,
      bestReactionScore: bestScores.reaction || 0,
      bestConnect4Score: bestScores.connect4 || 0,
      bestCryptowordScore: bestScores.cryptoword || 0,
    });
  };

  // 🔹 Listen to real-time user score updates
  useEffect(() => {
    const userId = user?.uid || user?.id || user?.userId;
    if (!userId) {
      console.warn('No valid userId found for profile.');
      setLoading(false);
      return;
    }

    const unsubscribe = listenToUserScores(userId, (scores) => {
      setUserScores(scores);
      processUserScores(scores);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 🔹 Get rank visuals
  const getRankIcon = (rank) => {
    switch (rank) {
      case 'Expert':
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 'Advanced':
        return <Medal className="w-6 h-6 text-purple-400" />;
      case 'Intermediate':
        return <Star className="w-6 h-6 text-blue-400" />;
      default:
        return <Target className="w-6 h-6 text-green-400" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'Expert':
        return 'from-yellow-500 to-yellow-600';
      case 'Advanced':
        return 'from-purple-500 to-purple-600';
      case 'Intermediate':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-green-500 to-green-600';
    }
  };

  // 🔹 Dynamic achievements
  const achievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Play your first game',
      icon: '🎮',
      unlocked: stats.totalGames >= 1,
      progress: Math.min(stats.totalGames, 1),
      maxProgress: 1,
    },
    {
      id: 2,
      title: 'Snake Master',
      description: 'Score 100+ in Snake Game',
      icon: '🐍',
      unlocked: stats.bestSnakeScore >= 100,
      progress: Math.min(stats.bestSnakeScore, 100),
      maxProgress: 100,
    },
    {
      id: 3,
      title: 'Lightning Reflexes',
      description: 'Score 3000+ in Reaction Tester',
      icon: '⚡',
      unlocked: stats.bestReactionScore >= 3000,
      progress: Math.min(stats.bestReactionScore, 3000),
      maxProgress: 3000,
    },
    {
      id: 4,
      title: 'Strategist',
      description: 'Win 3+ Connect 4 games',
      icon: '🟡',
      unlocked: stats.bestConnect4Score >= 3,
      progress: Math.min(stats.bestConnect4Score, 3),
      maxProgress: 3,
    },
    {
      id: 5,
      title: 'Cryptic Genius',
      description: 'Score 5000+ in Cryptoword',
      icon: '🔐',
      unlocked: stats.bestCryptowordScore >= 5000,
      progress: Math.min(stats.bestCryptowordScore, 5000),
      maxProgress: 5000,
    },
    {
      id: 6,
      title: 'Regular Player',
      description: 'Play 10 games',
      icon: '🏆',
      unlocked: stats.totalGames >= 10,
      progress: Math.min(stats.totalGames, 10),
      maxProgress: 10,
    },
    {
      id: 7,
      title: 'Consistent Performer',
      description: 'Average score above 1000',
      icon: '📈',
      unlocked: stats.averageScore >= 1000,
      progress: Math.min(stats.averageScore, 1000),
      maxProgress: 1000,
    },
  ];

  // 🔹 Loading spinner
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* User Info */}
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-12 h-12 text-black" />
        </div>
        <h2 className="text-4xl font-bold mb-2">{user?.username || 'Player'}</h2>
        <p className="text-gray-400 text-lg">{user?.regNumber || user?.email}</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          {getRankIcon(stats.rank)}
          <span
            className={`bg-gradient-to-r ${getRankColor(
              stats.rank
            )} bg-clip-text text-transparent font-bold text-xl`}
          >
            {stats.rank}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          {
            label: 'Games Played',
            value: stats.totalGames,
            color: 'green',
            icon: <Gamepad2 className="w-6 h-6 text-green-400" />,
          },
          {
            label: 'Best Snake',
            value: stats.bestSnakeScore,
            color: 'yellow',
            icon: <Trophy className="w-6 h-6 text-yellow-400" />,
          },
          {
            label: 'Best Reaction',
            value: stats.bestReactionScore,
            color: 'pink',
            icon: <Zap className="w-6 h-6 text-pink-400" />,
          },
          {
            label: 'Best Connect 4',
            value: stats.bestConnect4Score,
            color: 'orange',
            icon: <Target className="w-6 h-6 text-orange-400" />,
          },
          {
            label: 'Best Cryptoword',
            value: stats.bestCryptowordScore,
            color: 'purple',
            icon: <Star className="w-6 h-6 text-purple-400" />,
          },
          {
            label: 'Average Score',
            value: stats.averageScore,
            color: 'blue',
            icon: <Award className="w-6 h-6 text-blue-400" />,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-${stat.color}-500/30`}
          >
            <div className="flex items-center gap-3 mb-2">
              {stat.icon}
              <span className={`text-${stat.color}-400 font-semibold`}>
                {stat.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Games List */}
        <div className="bg-gray-800 p-6 rounded-xl border border-green-500/30">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="text-green-400" />
            Recent Games
          </h3>

          {userScores.length > 0 ? (
            <div className="space-y-3">
              {userScores.slice(0, 5).map((score, i) => (
                <div
                  key={i}
                  className="bg-gray-900 p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-white capitalize">
                      {normalizeGame(score.gameType || score.game)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(
                        score.timestamp?.toDate
                          ? score.timestamp.toDate()
                          : score.timestamp
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-400">
                      {score.score}
                    </div>
                    <div className="text-sm text-gray-400">points</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No games played yet</p>
              <p className="text-gray-500 text-sm">
                Start playing to see your history!
              </p>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-gray-800 p-6 rounded-xl border border-purple-500/30">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Award className="text-purple-400" />
            Achievements
          </h3>

          <div className="space-y-4">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`p-4 rounded-lg border transition-all ${
                  a.unlocked
                    ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-purple-500/50'
                    : 'bg-gray-900 border-gray-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`text-2xl ${
                      a.unlocked ? '' : 'grayscale opacity-50'
                    }`}
                  >
                    {a.icon}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`font-bold ${
                        a.unlocked ? 'text-purple-400' : 'text-gray-400'
                      }`}
                    >
                      {a.title}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      {a.description}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          a.unlocked ? 'bg-purple-500' : 'bg-green-500'
                        }`}
                        style={{
                          width: `${(a.progress / a.maxProgress) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.min(a.progress, a.maxProgress)}/{a.maxProgress}
                    </div>
                  </div>
                  {a.unlocked && (
                    <Star className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
