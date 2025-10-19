import React, { useState, useEffect, useRef } from "react";
import { Trophy, Lightbulb, RotateCcw, Sparkles, Clock } from "lucide-react";

const LOCAL_PHRASES = {
  Easy: [
    { phrase: "THE QUICK BROWN FOX", hint: "Famous pangram" },
    { phrase: "PRACTICE MAKES PERFECT", hint: "Common saying" },
    { phrase: "HONESTY IS THE BEST POLICY", hint: "Moral advice" },
    { phrase: "BETTER LATE THAN NEVER", hint: "Timeliness quote" },
  ],
  Medium: [
    { phrase: "ACTIONS SPEAK LOUDER THAN WORDS", hint: "Proverb" },
    { phrase: "TIME FLIES WHEN YOU ARE HAVING FUN", hint: "About time" },
    { phrase: "THE EARLY BIRD CATCHES THE WORM", hint: "Morning advice" },
    { phrase: "THE GRASS IS ALWAYS GREENER ON THE OTHER SIDE", hint: "About envy" },
  ],
  Hard: [
    { phrase: "FORTUNE FAVORS THE BOLD", hint: "Ancient wisdom" },
    { phrase: "ALL THAT GLITTERS IS NOT GOLD", hint: "Appearances deceive" },
    { phrase: "THE ROAD TO HELL IS PAVED WITH GOOD INTENTIONS", hint: "Cautionary proverb" },
    { phrase: "DISCRETION IS THE BETTER PART OF VALOR", hint: "Wisdom in retreat" },
  ],
};

const determineDifficulty = (phrase) => {
  const length = phrase.replace(/[^A-Z]/g, "").length;
  if (length <= 20) return "Easy";
  if (length <= 35) return "Medium";
  return "Hard";
};

const DIFFICULTY_TIMERS = {
  Easy: 60,
  Medium: 90,
  Hard: 120,
};

const CryptowordGame = ({ onGameOver }) => {
  const [puzzle, setPuzzle] = useState(null);
  const [gameState, setGameState] = useState("menu");
  const [cryptoMap, setCryptoMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [usedPhrases, setUsedPhrases] = useState([]); 
  const timerRef = useRef(null);
  const inputRefs = useRef({});

    const fetchPhrase = async () => {
    setLoading(true);
    let phrase = "";
    let hint = "";
    let difficulty = "Easy";

    try {
      const response = await fetch("https://api.quotable.io/random?maxLength=50");
      const data = await response.json();
      phrase = data.content.toUpperCase().replace(/[^A-Z ]/g, "");
      hint = `Quote by ${data.author}`;
      difficulty = determineDifficulty(phrase);
    } catch {
      const difficulties = Object.keys(LOCAL_PHRASES);
      let available = difficulties.flatMap((diff) =>
        LOCAL_PHRASES[diff].map((p) => ({ ...p, difficulty: diff }))
      );

      const unused = available.filter((p) => !usedPhrases.includes(p.phrase));
      const phrasePool = unused.length > 0 ? unused : available;
      const randomPhrase = phrasePool[Math.floor(Math.random() * phrasePool.length)];

      phrase = randomPhrase.phrase;
      hint = randomPhrase.hint;
      difficulty = randomPhrase.difficulty;
    } finally {
      setUsedPhrases((prev) => [...prev, phrase]);
      setPuzzle({ phrase, hint, difficulty });
      setLoading(false);
    }
  };


  useEffect(() => {
    if (gameState === "playing" && puzzle) {
      generateCryptoMap();
      startTimer(puzzle.difficulty);
    }
    return () => clearInterval(timerRef.current);
  }, [puzzle, gameState]);

  const generateCryptoMap = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const numbers = Array.from({ length: 26 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    const numberMap = {};
    const reverseMap = {};
    alphabet.forEach((letter, i) => {
      numberMap[letter] = numbers[i];
      reverseMap[numbers[i]] = letter;
    });
    const phraseLetters = [...new Set(puzzle.phrase.replace(/[^A-Z]/g, ""))];
    const revealed = new Set(phraseLetters.sort(() => Math.random() - 0.5).slice(0, 3));
    setCryptoMap({ numberMap, reverseMap });
    setRevealedLetters(revealed);
    setUserMap({});
  };

  const startGame = async () => {
    setScore(0);
    setLevel(1);
    await fetchPhrase();
    setGameState("playing");
    setHintsUsed(0);
  };

  const startTimer = (difficulty) => {
    clearInterval(timerRef.current);
    setTimeLeft(DIFFICULTY_TIMERS[difficulty]);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    setGameState("finished");
    if (typeof onGameOver === "function") onGameOver(score);
  };

  const handleLetterInput = (cipherNumber, value) => {
    const letter = value.toUpperCase();
    if (!letter) {
      const newMap = { ...userMap };
      delete newMap[cipherNumber];
      setUserMap(newMap);
      return;
    }
    if (!/[A-Z]/.test(letter)) return;
    setUserMap({ ...userMap, [cipherNumber]: letter });
  };

  const checkWin = () => {
    const phrase = puzzle.phrase;
    const clean = phrase.replace(/[^A-Z]/g, "");
    for (let ch of clean) {
      const num = cryptoMap.numberMap[ch];
      if (revealedLetters.has(ch)) continue;
      if (!userMap[num] || userMap[num] !== ch) return false;
    }
    return true;
  };

  const useHint = () => {
    const phrase = puzzle.phrase;
    const letters = phrase.replace(/[^A-Z]/g, "");
    const unsolved = [...new Set(letters)].filter((l) => {
      const num = cryptoMap.numberMap[l];
      return !userMap[num] || userMap[num] !== l;
    });
    if (unsolved.length > 0) {
      const hintLetter = unsolved[Math.floor(Math.random() * unsolved.length)];
      const num = cryptoMap.numberMap[hintLetter];
      setUserMap({ ...userMap, [num]: hintLetter });
      setHintsUsed((h) => h + 1);
      setScore((s) => Math.max(0, s - 50));
    }
  };

  const checkAnswer = () => {
    if (checkWin()) {
      const bonus = Math.max(0, 500 - hintsUsed * 100);
      const newScore = score + bonus;
      setScore(newScore);
      clearInterval(timerRef.current);
      setTimeout(async () => {
        // 🆕 Next level
        setLevel((lvl) => lvl + 1);
        await fetchPhrase();
        setHintsUsed(0);
      }, 800);
    } else {
      Object.entries(userMap).forEach(([num, letter]) => {
        const actual = cryptoMap.reverseMap[num];
        const input = Object.values(inputRefs.current).find(
          (el) => el && el.dataset.num === num
        );
        if (actual !== letter && input) {
          input.classList.add("animate-pulse", "border-red-600");
          setTimeout(() => input.classList.remove("animate-pulse", "border-red-600"), 700);
        }
      });
    }
  };

  const renderPuzzle = () => {
    if (!cryptoMap.numberMap) return null;
    const phrase = puzzle.phrase;
    const words = phrase.split(" ");
    const allLetters = [...new Set(phrase.replace(/[^A-Z]/g, ""))];
    let index = 0;
    return (
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        {words.map((word, wi) => (
          <div key={wi} className="flex flex-col gap-1.5">
            <div className="flex gap-1.5">
              {word.split("").map((char, ci) => {
                if (!/[A-Z]/.test(char)) return <div key={ci} className="w-4" />;
                const id = index++;
                const num = cryptoMap.numberMap[char];
                const isRevealed = revealedLetters.has(char);
                const userLetter = userMap[num];
                const color =
                  !userLetter
                    ? "border-gray-500 bg-gray-800/50"
                    : userLetter === char
                    ? "border-green-500 bg-green-600/40"
                    : allLetters.includes(userLetter)
                    ? "border-yellow-400 bg-yellow-500/30"
                    : "border-red-500 bg-red-600/40";
                return (
                  <div key={ci} className="flex flex-col items-center">
                    <input
                      ref={(el) => (inputRefs.current[`${id}-${num}`] = el)}
                      data-num={num}
                      type="text"
                      maxLength="1"
                      value={isRevealed ? char : userLetter || ""}
                      disabled={isRevealed}
                      onChange={(e) => handleLetterInput(num, e.target.value)}
                      className={`w-9 h-9 text-center text-lg font-bold border-2 rounded-md text-white uppercase transition-all shadow-md ${
                        isRevealed
                          ? "bg-green-600/40 border-green-400"
                          : color
                      } focus:outline-none focus:ring-2 focus:ring-purple-400`}
                    />
                    <div className="text-[10px] text-gray-400 mt-1 font-mono font-semibold">
                      {num}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (gameState === "menu")
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        <div className="text-center space-y-8 w-full max-w-md px-6">
          <div>
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-400 animate-pulse" />
            <h1 className="text-6xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              CRYPTOWORD
            </h1>
            <p className="text-lg text-gray-300 mt-3">Decode the hidden phrase</p>
          </div>

          <div className="bg-gray-800/60 rounded-lg p-5 border border-gray-700 shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-purple-300">How to Play</h3>
            <ul className="text-sm text-gray-300 space-y-2 text-left font-mono">
              <li>🔢 Each letter is replaced with a number</li>
              <li>💡 Use hints to reveal letters (-50 points)</li>
              <li>🎯 Decode the phrase before time runs out!</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-xl font-bold hover:from-purple-500 hover:to-blue-500 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
          >
            {loading ? "Loading..." : "START GAME"}
          </button>
        </div>
      </div>
    );

  if (gameState === "finished")
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
        <div className="text-center space-y-6 max-w-md">
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto animate-bounce" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Game Over
          </h1>
          <div className="bg-gray-800/50 rounded-lg p-8 border border-yellow-500/30">
            <p className="text-5xl font-bold text-yellow-400 mb-1">{score}</p>
            <p className="text-gray-300 text-lg">Final Score</p>
          </div>
          <button
            onClick={() => setGameState("menu")}
            className="w-full px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xl font-bold rounded-lg hover:from-green-500 hover:to-emerald-500 transform hover:scale-105 transition-all shadow-lg"
          >
            Play Again
          </button>
        </div>
      </div>
    );

  if (!puzzle) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              CRYPTOWORD
            </h1>
            <p className="text-sm text-gray-300">Level {level}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-yellow-400">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-bold">{timeLeft}s</span>
            </div>
            <div className="text-right bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-2xl font-bold text-yellow-400 mb-1">{score}</p>
              <p className="text-xs text-gray-400">Hints: {hintsUsed}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 rounded-lg p-4 mb-6 border border-purple-500/50 shadow-lg">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <p className="text-sm text-white font-medium">{puzzle.hint}</p>
          </div>
        </div>

        <div className="bg-gray-800/70 rounded-lg p-6 border-2 border-gray-700 mb-6 shadow-xl">
          {renderPuzzle()}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={useHint}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-md flex items-center gap-2 font-bold text-sm transition-all hover:scale-105 shadow-md"
          >
            <Lightbulb className="w-4 h-4" /> Hint (-50)
          </button>
          <button
            onClick={checkAnswer}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-md flex items-center gap-2 font-bold text-base transition-all hover:scale-105 shadow-md"
          >
            Submit
          </button>
          <button
            onClick={generateCryptoMap}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-md flex items-center gap-2 font-bold text-sm transition-all hover:scale-105 shadow-md"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default CryptowordGame;
