import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trophy, Lightbulb, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';

const CryptowordGame = () => {
const puzzles = [
  // 🟢 EASY (15)
  { phrase: "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG", hint: "Famous pangram", difficulty: "Easy" },
  { phrase: "PRACTICE MAKES PERFECT", hint: "Common saying", difficulty: "Easy" },
  { phrase: "KNOWLEDGE IS POWER", hint: "Famous quote", difficulty: "Easy" },
  { phrase: "HONESTY IS THE BEST POLICY", hint: "Moral advice", difficulty: "Easy" },
  { phrase: "BETTER LATE THAN NEVER", hint: "Common proverb", difficulty: "Easy" },
  { phrase: "LOOK BEFORE YOU LEAP", hint: "Think before acting", difficulty: "Easy" },
  { phrase: "EASIER SAID THAN DONE", hint: "Reality check", difficulty: "Easy" },
  { phrase: "DON’T JUDGE A BOOK BY ITS COVER", hint: "About appearances", difficulty: "Easy" },
  { phrase: "TWO HEADS ARE BETTER THAN ONE", hint: "Teamwork", difficulty: "Easy" },
  { phrase: "A FRIEND IN NEED IS A FRIEND INDEED", hint: "True friendship", difficulty: "Easy" },
  { phrase: "NO PAIN NO GAIN", hint: "Fitness motto", difficulty: "Easy" },
  { phrase: "AN APPLE A DAY KEEPS THE DOCTOR AWAY", hint: "Health tip", difficulty: "Easy" },
  { phrase: "EVERY CLOUD HAS A SILVER LINING", hint: "Optimism", difficulty: "Easy" },
  { phrase: "LAUGHTER IS THE BEST MEDICINE", hint: "Cheerful saying", difficulty: "Easy" },
  { phrase: "WHEN IN ROME DO AS THE ROMANS DO", hint: "Adapt to surroundings", difficulty: "Easy" },

  // 🟡 MEDIUM (20)
  { phrase: "TIME FLIES WHEN YOU ARE HAVING FUN", hint: "About time", difficulty: "Medium" },
  { phrase: "ACTIONS SPEAK LOUDER THAN WORDS", hint: "Proverb", difficulty: "Medium" },
  { phrase: "THE EARLY BIRD CATCHES THE WORM", hint: "Morning advice", difficulty: "Medium" },
  { phrase: "DON’T COUNT YOUR CHICKENS BEFORE THEY HATCH", hint: "Be patient", difficulty: "Medium" },
  { phrase: "BIRDS OF A FEATHER FLOCK TOGETHER", hint: "About similarity", difficulty: "Medium" },
  { phrase: "THE PEN IS MIGHTIER THAN THE SWORD", hint: "Power of words", difficulty: "Medium" },
  { phrase: "NEVER PUT ALL YOUR EGGS IN ONE BASKET", hint: "Investment wisdom", difficulty: "Medium" },
  { phrase: "A JOURNEY OF A THOUSAND MILES BEGINS WITH A SINGLE STEP", hint: "Motivational", difficulty: "Medium" },
  { phrase: "THE GRASS IS ALWAYS GREENER ON THE OTHER SIDE", hint: "Envy warning", difficulty: "Medium" },
  { phrase: "TO ERR IS HUMAN TO FORGIVE DIVINE", hint: "Forgiveness quote", difficulty: "Medium" },
  { phrase: "YOU CAN’T HAVE YOUR CAKE AND EAT IT TOO", hint: "Can’t have everything", difficulty: "Medium" },
  { phrase: "THERE IS NO PLACE LIKE HOME", hint: "Comfort zone", difficulty: "Medium" },
  { phrase: "THE CUSTOMER IS ALWAYS RIGHT", hint: "Business mantra", difficulty: "Medium" },
  { phrase: "OLD HABITS DIE HARD", hint: "Behavioral truth", difficulty: "Medium" },
  { phrase: "DON’T BITE THE HAND THAT FEEDS YOU", hint: "Ingratitude warning", difficulty: "Medium" },
  { phrase: "THE MORE THE MERRIER", hint: "Group fun", difficulty: "Medium" },
  { phrase: "TOO MANY COOKS SPOIL THE BROTH", hint: "Teamwork caution", difficulty: "Medium" },
  { phrase: "ABSENCE MAKES THE HEART GROW FONDER", hint: "Love quote", difficulty: "Medium" },
  { phrase: "NECESSITY IS THE MOTHER OF INVENTION", hint: "Innovation origin", difficulty: "Medium" },
  { phrase: "BEAUTY IS IN THE EYE OF THE BEHOLDER", hint: "Subjective opinion", difficulty: "Medium" },

  // 🔴 HARD (15)
  { phrase: "FORTUNE FAVORS THE BOLD", hint: "Ancient wisdom", difficulty: "Hard" },
  { phrase: "WHERE THERE IS A WILL THERE IS A WAY", hint: "Motivational", difficulty: "Hard" },
  { phrase: "A WOLF IN SHEEPS CLOTHING", hint: "Deceptive appearance", difficulty: "Hard" },
  { phrase: "THE ROAD TO HELL IS PAVED WITH GOOD INTENTIONS", hint: "Warning about actions", difficulty: "Hard" },
  { phrase: "EVERY DOG HAS ITS DAY", hint: "Patience proverb", difficulty: "Hard" },
  { phrase: "YOU REAP WHAT YOU SOW", hint: "Karma saying", difficulty: "Hard" },
  { phrase: "ALL THAT GLITTERS IS NOT GOLD", hint: "Appearances deceive", difficulty: "Hard" },
  { phrase: "THE PROOF OF THE PUDDING IS IN THE EATING", hint: "Test results", difficulty: "Hard" },
  { phrase: "HE WHO LAUGHS LAST LAUGHS BEST", hint: "Patience and success", difficulty: "Hard" },
  { phrase: "THE ENDS JUSTIFY THE MEANS", hint: "Machiavellian idea", difficulty: "Hard" },
  { phrase: "YOU CANNOT JUDGE A BOOK BY ITS COVER", hint: "About judgment", difficulty: "Hard" },
  { phrase: "THE DEVIL IS IN THE DETAILS", hint: "About precision", difficulty: "Hard" },
  { phrase: "FAMILIARITY BREEDS CONTEMPT", hint: "Overexposure issue", difficulty: "Hard" },
  { phrase: "DISCRETION IS THE BETTER PART OF VALOR", hint: "Wisdom in retreat", difficulty: "Hard" },
  { phrase: "GREAT MINDS THINK ALIKE", hint: "Coincidence compliment", difficulty: "Hard" }
];


  const [gameState, setGameState] = useState('menu');
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [cryptoMap, setCryptoMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [errors, setErrors] = useState(new Set());
  const inputRefs = useRef({});

  useEffect(() => {
    if (gameState === 'playing') {
      generateCryptoMap();
    }
  }, [currentPuzzle, gameState]);

  const generateCryptoMap = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
    const map = {};
    alphabet.forEach((letter, i) => {
      map[letter] = shuffled[i];
    });
    setCryptoMap(map);
    setUserMap({});
    setErrors(new Set());
    setSelectedCell(null);
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentPuzzle(0);
    setScore(1000);
    setHintsUsed(0);
  };

  const handleLetterInput = (cryptoLetter, value) => {
    if (!value || value.length === 0) {
      const newMap = { ...userMap };
      delete newMap[cryptoLetter];
      setUserMap(newMap);
      checkErrors(newMap);
      return;
    }

    const letter = value.toUpperCase();
    if (!/[A-Z]/.test(letter)) return;

    // Check if letter already used for different crypto letter
    const newErrors = new Set(errors);
    Object.entries(userMap).forEach(([key, val]) => {
      if (key !== cryptoLetter && val === letter) {
        newErrors.add(key);
        newErrors.add(cryptoLetter);
      }
    });

    const newMap = { ...userMap, [cryptoLetter]: letter };
    setUserMap(newMap);
    checkErrors(newMap);
  };

  const checkErrors = (map) => {
    const newErrors = new Set();
    const usedLetters = {};
    
    Object.entries(map).forEach(([crypto, user]) => {
      if (usedLetters[user]) {
        newErrors.add(crypto);
        newErrors.add(usedLetters[user]);
      } else {
        usedLetters[user] = crypto;
      }
    });
    
    setErrors(newErrors);
  };

  const checkWin = () => {
    const phrase = puzzles[currentPuzzle].phrase;
    const letters = phrase.replace(/[^A-Z]/g, '');
    
    for (let letter of letters) {
      const crypto = cryptoMap[letter];
      if (!userMap[crypto] || userMap[crypto] !== letter) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (gameState === 'playing' && Object.keys(userMap).length > 0 && checkWin()) {
      const bonus = Math.max(0, 500 - hintsUsed * 100);
      setScore(s => s + bonus);
      
      if (currentPuzzle < puzzles.length - 1) {
        setTimeout(() => {
          setCurrentPuzzle(c => c + 1);
          setHintsUsed(0);
        }, 1500);
      } else {
        setTimeout(() => {
          setGameState('finished');
        }, 1500);
      }
    }
  }, [userMap, gameState]);

  const useHint = () => {
    const phrase = puzzles[currentPuzzle].phrase;
    const letters = phrase.replace(/[^A-Z]/g, '');
    const unsolvedLetters = [...new Set(letters)].filter(letter => {
      const crypto = cryptoMap[letter];
      return !userMap[crypto] || userMap[crypto] !== letter;
    });

    if (unsolvedLetters.length > 0) {
      const randomLetter = unsolvedLetters[Math.floor(Math.random() * unsolvedLetters.length)];
      const crypto = cryptoMap[randomLetter];
      setUserMap({ ...userMap, [crypto]: randomLetter });
      setHintsUsed(h => h + 1);
      setScore(s => Math.max(0, s - 50));
    }
  };

  const moveSelection = (direction) => {
    if (!selectedCell) return;
    
    const phrase = puzzles[currentPuzzle].phrase;
    const positions = [];
    
    for (let i = 0; i < phrase.length; i++) {
      if (/[A-Z]/.test(phrase[i])) {
        positions.push(i);
      }
    }
    
    const currentIndex = positions.indexOf(selectedCell);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'left' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(positions.length - 1, currentIndex + 1);
    
    const newPos = positions[newIndex];
    setSelectedCell(newPos);
    
    const crypto = cryptoMap[phrase[newPos]];
    if (inputRefs.current[`${newPos}-${crypto}`]) {
      inputRefs.current[`${newPos}-${crypto}`].focus();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing' || !selectedCell) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveSelection('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveSelection('right');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, selectedCell]);

  const renderPuzzle = () => {
    const phrase = puzzles[currentPuzzle].phrase;
    const words = phrase.split(' ');
    
    let charIndex = 0;
    
    return (
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        {words.map((word, wordIdx) => (
          <div key={wordIdx} className="flex flex-col gap-2">
            <div className="flex gap-1">
              {word.split('').map((char, charIdx) => {
                const currentCharIndex = charIndex++;
                const crypto = cryptoMap[char];
                const isSelected = selectedCell === currentCharIndex;
                const hasError = errors.has(crypto);
                
                return (
                  <div key={charIdx} className="flex flex-col items-center">
                    <input
                      ref={el => inputRefs.current[`${currentCharIndex}-${crypto}`] = el}
                      type="text"
                      maxLength="1"
                      value={userMap[crypto] || ''}
                      onChange={(e) => handleLetterInput(crypto, e.target.value)}
                      onFocus={() => setSelectedCell(currentCharIndex)}
                      className={`w-10 h-10 text-center text-xl font-bold border-2 rounded bg-gray-800 text-white uppercase transition-all ${
                        isSelected ? 'border-yellow-400 ring-2 ring-yellow-400' : 
                        hasError ? 'border-red-500' :
                        userMap[crypto] && cryptoMap[userMap[crypto]] === crypto ? 'border-green-500' :
                        'border-gray-600'
                      }`}
                    />
                    <div className="text-xs text-gray-500 mt-1 font-mono">{crypto}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getUsedLetters = () => {
    return Object.values(userMap).filter((v, i, arr) => arr.indexOf(v) === i);
  };

  if (gameState === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4 animate-bounce" />
          <h1 className="text-5xl font-bold text-white mb-4">VICTORY!</h1>
          <p className="text-3xl text-green-400 mb-8">Final Score: {score}</p>
          <button
            onClick={() => setGameState('menu')}
            className="px-12 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xl font-bold rounded-lg hover:from-green-400 hover:to-blue-400 transition-all transform hover:scale-105"
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">CRYPTOWORD</h1>
            <p className="text-gray-400">Level {currentPuzzle + 1} / {puzzles.length}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-400">Score: {score}</p>
            <p className="text-sm text-gray-400">Hints Used: {hintsUsed}</p>
          </div>
        </div>

        {/* Puzzle Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border-2 border-purple-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white font-semibold">Hint: {puzzles[currentPuzzle].hint}</p>
              <p className="text-gray-400 text-sm">Difficulty: {puzzles[currentPuzzle].difficulty}</p>
            </div>
            <button
              onClick={useHint}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg flex items-center gap-2 transition-all"
            >
              <Lightbulb className="w-5 h-5" />
              Get Hint (-50)
            </button>
          </div>
        </div>

        {/* Puzzle */}
        <div className="bg-gray-800 rounded-lg p-8 mb-6 border-2 border-gray-700">
          {renderPuzzle()}
          
          {/* Navigation Hint */}
          <div className="flex justify-center gap-4 text-gray-500 text-sm">
            <span className="flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> / <ArrowRight className="w-4 h-4" /> to navigate
            </span>
          </div>
        </div>

        {/* Alphabet Tracker */}
        <div className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
          <p className="text-white font-semibold mb-2">Letters Used:</p>
          <div className="flex flex-wrap gap-2">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
              <div
                key={letter}
                className={`w-8 h-8 flex items-center justify-center rounded font-bold text-sm ${
                  getUsedLetters().includes(letter)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-500'
                }`}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={generateCryptoMap}
          className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg flex items-center gap-2 mx-auto transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          Reset Puzzle
        </button>
      </div>
    </div>
  );
};

export default CryptowordGame;