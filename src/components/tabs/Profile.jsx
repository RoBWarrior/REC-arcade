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
  Users
} from 'lucide-react';
import { getUserScoresByTrack } from '../../services/firebaseService';
import { getTrackDisplayName } from '../../services/trackService';

const Profile = ({ user }) => {
  const [userScores, setUserScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    bestSnakeScore: 0,
    bestReactionScore: 0,
    averageScore: 0,
    rank: 'Rookie'
  });

  useEffect(() => {
    loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    setLoading(true);
    try {
      if (user?.id && user?.track) {
        // Get user's scores from their track
        const userScoresData = await getUserScoresByTrack(user.id, user.track);
        setUserScores(userScoresData);

        // Calculate stats from user's actual game stats or scores
        const gameStats = user.gameStats || {};
        const snakeScoresForUser = userScoresData.filter(s => s.game === 'snake');
        const reactionScoresForUser = userScoresData.filter(s => s.game === 'reaction');

        const bestSnake = gameStats.bestSnakeScore || 
          (snakeScoresForUser.length > 0 ? Math.max(...snakeScoresForUser.map(s => s.score)) : 0);
        const bestReaction = gameStats.bestReactionScore || 
          (reactionScoresForUser.length > 0 ? Math.max(...reactionScoresForUser.map(s => s.score)) : 0);

        const totalGames = gameStats.totalGamesPlayed || userScoresData.length;
        const averageScore = totalGames > 0 ? 
          (gameStats.totalScore || userScoresData.reduce((sum, score) => sum + score.score, 0)) / totalGames : 0;

        // Determine rank based on performance
        let rank = 'Rookie';
        if (totalGames >= 10 && averageScore > 2000) rank = 'Expert';
        else if (totalGames >= 5 && averageScore > 1000) rank = 'Advanced';
        else if (totalGames >= 2) rank = 'Intermediate';

        setStats({
          totalGames,
          bestSnakeScore: bestSnake,
          bestReactionScore: bestReaction,
          averageScore: Math.round(averageScore),
          rank
        });
      } else {
        // Fallback for demo mode or incomplete user data
        setStats({
          totalGames: 0,
          bestSnakeScore: 0,
          bestReactionScore: 0,
          averageScore: 0,
          rank: 'Rookie'
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const achievements = [
    {
      id: 1,
      title: 'First Steps',
      description: 'Play your first game',
      icon: '🎮',
      unlocked: stats.totalGames >= 1,
      progress: Math.min(stats.totalGames, 1),
      maxProgress: 1
    },
    {
      id: 2,
      title: 'Snake Master',
      description: 'Score 100+ in Snake Game',
      icon: '🐍',
      unlocked: stats.bestSnakeScore >= 100,
      progress: Math.min(stats.bestSnakeScore, 100),
      maxProgress: 100
    },
    {
      id: 3,
      title: 'Lightning Reflexes',
      description: 'Score 3000+ in Reaction Tester',
      icon: '⚡',
      unlocked: stats.bestReactionScore >= 3000,
      progress: Math.min(stats.bestReactionScore, 3000),
      maxProgress: 3000
    },
    {
      id: 4,
      title: 'Regular Player',
      description: 'Play 10 games',
      icon: '🏆',
      unlocked: stats.totalGames >= 10,
      progress: Math.min(stats.totalGames, 10),
      maxProgress: 10
    },
    {
      id: 5,
      title: 'Consistent Performer',
      description: 'Average score above 1000',
      icon: '📈',
      unlocked: stats.averageScore >= 1000,
      progress: Math.min(stats.averageScore, 1000),
      maxProgress: 1000
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-12 h-12 text-black" />
        </div>
        <h2 className="text-4xl font-bold mb-2">{user.username}</h2>
        <p className="text-gray-400 text-lg">{user.regNumber}</p>
        {user.track && (
          <div className="flex items-center justify-center gap-2 mt-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-semibold">
              {getTrackDisplayName(user.track)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-center gap-2 mt-4">
          {getRankIcon(stats.rank)}
          <span className={`bg-gradient-to-r ${getRankColor(stats.rank)} bg-clip-text text-transparent font-bold text-xl`}>
            {stats.rank}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Gamepad2 className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-semibold">Games Played</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalGames}</div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Best Snake</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.bestSnakeScore}</div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-pink-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-pink-400" />
            <span className="text-pink-400 font-semibold">Best Reaction</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.bestReactionScore}</div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-blue-400" />
            <span className="text-blue-400 font-semibold">Average Score</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.averageScore}</div>
        </div>
      </div>

      {/* Recent Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-green-500/30">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="text-green-400" />
            Recent Games
          </h3>
          
          {userScores.length > 0 ? (
            <div className="space-y-3">
              {userScores.slice(0, 5).map((score, index) => (
                <div key={index} className="bg-gray-900 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white capitalize">{score.game} Game</div>
                    <div className="text-sm text-gray-400">
                      {new Date(score.timestamp.toDate ? score.timestamp.toDate() : score.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-400">{score.score}</div>
                    <div className="text-sm text-gray-400">points</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No games played yet</p>
              <p className="text-gray-500 text-sm">Start playing to see your history!</p>
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
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg border transition-all ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-purple-500/50' 
                    : 'bg-gray-900 border-gray-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold ${achievement.unlocked ? 'text-purple-400' : 'text-gray-400'}`}>
                      {achievement.title}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">{achievement.description}</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          achievement.unlocked ? 'bg-purple-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {achievement.progress}/{achievement.maxProgress}
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <Star className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Goals */}
      <div className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-xl border border-green-500/30">
        <h3 className="text-2xl font-bold mb-6 text-center">Next Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h4 className="font-bold text-green-400 mb-2">Improve Snake Score</h4>
            <p className="text-gray-400 text-sm">
              Try to beat your best score of {stats.bestSnakeScore}
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-bold text-pink-400 mb-2">Faster Reactions</h4>
            <p className="text-gray-400 text-sm">
              Aim for a reaction score above {stats.bestReactionScore + 500}
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h4 className="font-bold text-yellow-400 mb-2">Unlock Achievements</h4>
            <p className="text-gray-400 text-sm">
              {achievements.filter(a => !a.unlocked).length} achievements remaining
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
