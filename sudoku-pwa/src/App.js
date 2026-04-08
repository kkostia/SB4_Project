import { useState, useEffect } from "react";
import "./App.css";
import HomePage from "./components/HomePage.jsx";
import GameBoard from "./components/Game.jsx";
import { fetchPuzzle } from "./api/sudokuAPI.js";
import { getXP, addXP, calcXPForGame } from "./ranking.js";

function checkAchievement(difficulty, elapsed) {
  const thresholds = {
    easy: { bronze: 300, silver: 180, gold: 120 },
    medium: { bronze: 600, silver: 420, gold: 300 },
    hard: { bronze: 900, silver: 660, gold: 480 }
  };

  const times = thresholds[difficulty];
  if (!times) return null;

  if (elapsed <= times.gold) return { id: `${difficulty}-gold`, name: `${difficulty} Gold`, time: times.gold };
  if (elapsed <= times.silver) return { id: `${difficulty}-silver`, name: `${difficulty} Silver`, time: times.silver };
  if (elapsed <= times.bronze) return { id: `${difficulty}-bronze`, name: `${difficulty} Bronze`, time: times.bronze };

  return null;
}

// Adding a function in order to save game results
function saveGameResults(result) {
  const existingResults = JSON.parse(localStorage.getItem("sudoku-results") || "[]");

  const newResult = {
    ...result,
    date: new Date().toISOString(),
  };

  const updatedResults = [...existingResults, newResult];
  localStorage.setItem("sudoku-results", JSON.stringify(updatedResults));
}

// Adding a function to compare game results
function getPerformanceComparison(currentResult) {
  const pastResults = JSON.parse(localStorage.getItem("sudoku-results") || "[]");

  const sameDifficultyWins = pastResults.filter(
    (game) => game.difficulty === currentResult.difficulty && game.won
  );

  if (sameDifficultyWins.length === 0) {
    return {
      message: "This is your first completed game at this difficulty.",
      bestTime: null,
      averageTime: null,
      previousTime: null,
    };
  }

  const previousGame = sameDifficultyWins[sameDifficultyWins.length - 1];
  const bestTime = Math.min(...sameDifficultyWins.map((game) => game.elapsed));
  const averageTime = Math.round(
    sameDifficultyWins.reduce((sum, game) => sum + game.elapsed, 0) / sameDifficultyWins.length
  );

  let comparisonMessage = `Your previous best time was ${bestTime}s.`;

  if (currentResult.won && previousGame) {
    if (currentResult.elapsed < previousGame.elapsed) {
      comparisonMessage = "You improved compared to your last completed game.";
    } else if (currentResult.elapsed > previousGame.elapsed) {
      comparisonMessage = "You were slower than your last completed game.";
    } else {
      comparisonMessage = "You matched your last completed game.";
    }
  }

  return {
    message: comparisonMessage,
    bestTime,
    averageTime,
    previousTime: previousGame.elapsed,
  };
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("sudoku-theme") || "dark");
  const [largeFont, setLargeFont] = useState(false);

  //sound toggle state, persisted to localStorage
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("sudoku-sound") !== "off");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function handleSetTheme(newTheme) {
    setTheme(newTheme);
    localStorage.setItem("sudoku-theme", newTheme);
  }

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-font-size",
      largeFont ? "large" : "normal",
    );
  }, [largeFont]);

  function toggleFontSize() {
    setLargeFont((prev) => !prev);
  }

  function toggleSound() {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem("sudoku-sound", next ? "on" : "off");
      return next;
    });
  }

  const [screen, setScreen] = useState("home");
  const [difficulty, setDifficulty] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [solution, setSolution] = useState(null);
  const [timeLimit, setTimeLimit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem("sudoku-streak")) || 0);
  const [achievements, setAchievements] = useState(() => JSON.parse(localStorage.getItem("sudoku-achievements")) || []);
  const [xp, setXP] = useState(() => getXP());


  async function handleStartGame(diff, limit) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPuzzle(diff);
      setDifficulty(diff);
      setPuzzle(data.puzzle);
      setSolution(data.solution);
      setTimeLimit(limit ?? null);
      setScreen("game");
    } catch (err) {
      setError("Failed to load puzzle. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (screen === "home")
    return (
      <>
        <HomePage
          onStartGame={handleStartGame}
          lastResult={lastResult}
          theme={theme}
          onSetTheme={handleSetTheme}
          largeFont={largeFont}
          onToggleFontSize={toggleFontSize}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          achievements={achievements}
          streak={streak}
          xp={xp}
        />

        {loading && (
          <p style={{ color: "#fff", textAlign: "center" }}>Loading...</p>
        )}
        {error && (
          <p style={{ color: "#f87171", textAlign: "center" }}>{error}</p>
        )}
      </>
    );

  if (screen === "game")
    return (
      <GameBoard
        puzzle={puzzle}
        solution={solution}
        difficulty={difficulty}
        timeLimit={timeLimit}
        onGameEnd={(result) => {
          const performanceComparison = getPerformanceComparison(result);
          saveGameResults(result);
          setLastResult({
            ...result, comparison: performanceComparison,
          });

          setStreak((prev) => {
            const next = result.won ? prev + 1 : 0;
            localStorage.setItem("sudoku-streak", next);
            return next;
          });

          if (result.won) {
            const newAchievement = checkAchievement(result.difficulty, result.elapsed);
            if (newAchievement) {
              setAchievements(prev => {
                const updated = [...prev, newAchievement];
                localStorage.setItem("sudoku-achievements", JSON.stringify(updated));
                return updated;
              });
            }
          }

          const earned = calcXPForGame(result.difficulty, result.elapsed, result.won);
          if (earned > 0) {
            const newXP = addXP(earned);
            setXP(newXP);
          }

          setScreen("home");
        }}
        onBack={() => setScreen("home")}

        theme={theme}
        largeFont={largeFont}
        soundEnabled={soundEnabled}
      />
    );
}

export default App;
