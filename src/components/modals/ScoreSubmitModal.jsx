import React, { useState } from 'react';
import { X, Trophy, Check } from 'lucide-react';
import { addScore } from '../../services/firebaseService';

const ScoreSubmitModal = ({ score, game, user, onClose }) => {
  const [playerName, setPlayerName] = useState(user?.username || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!playerName.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await addScore(game, playerName.trim(), score);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting score:', error);
      // Still close the modal even if there's an error
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSubmitting && !submitted) {
      handleSubmit();
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-8 rounded-xl border-2 border-green-500 max-w-md w-full mx-4">
          <div className="text-center">
            <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4 text-green-400">Score Submitted!</h3>
            <p className="text-white mb-2">Great job, {playerName}!</p>
            <p className="text-gray-400">Your score has been recorded.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-xl border-2 border-green-500 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h3 className="text-2xl font-bold">Game Over!</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-3xl font-bold text-green-400 mb-2">{score}</p>
          <p className="text-white mb-1">Your Score</p>
          <p className="text-gray-400 text-sm capitalize">{game} Game</p>
        </div>

        <div className="mb-6">
          <label className="block text-green-400 font-semibold mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your display name"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleSubmit}
            disabled={!playerName.trim() || isSubmitting}
            className="flex-1 px-6 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              'Submit Score'
            )}
          </button>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScoreSubmitModal;
