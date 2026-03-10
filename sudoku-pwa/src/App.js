import { useState } from "react";
import HomePage from "./components/HomePage.jsx";
import GameBoard from "./components/Game.jsx";
import { fetchPuzzle } from "./api/sudokuAPI.js";

function App() {
  const [screen, setScreen] = useState("home");
  const [difficulty, setDifficulty] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleStartGame(diff) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPuzzle(diff);
      setDifficulty(diff);
      setPuzzle(data.puzzle);
      setSolution(data.solution);
      setScreen("game");
    } catch (err) {
      setError("Failed to load puzzle. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (screen === "home") return (
    <>
      <HomePage onStartGame={handleStartGame} />
      {loading && <p style={{ color: "#fff", textAlign: "center" }}>Loading...</p>}
      {error   && <p style={{ color: "#f87171", textAlign: "center" }}>{error}</p>}
    </>
  );

  if (screen === "game") return (
    <GameBoard
      puzzle={puzzle}
      solution={solution}
      difficulty={difficulty}
      onBack={() => setScreen("home")}
    />
  );
}

export default App;