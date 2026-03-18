import { useState, useEffect } from "react";
import "./App.css";
import HomePage from "./components/HomePage.jsx";
import GameBoard from "./components/Game.jsx";
import { fetchPuzzle } from "./api/sudokuAPI.js";

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
          streak={streak}
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
          setLastResult(result);
          setStreak(prev => {
            const next = result.won ? prev + 1 : 0;
            localStorage.setItem("sudoku-streak", next);
            return next;
          });
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
