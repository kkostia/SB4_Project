import { useState } from "react";
import HomePage from "./components/HomePage.jsx";

function App() {
  const [screen, setScreen] = useState("home");
  const [difficulty, setDifficulty] = useState(null);

  function handleStartGame(diff) {
    setDifficulty(diff);
    setScreen("game");
  }

  if (screen === "home") {
    return <HomePage onStartGame={handleStartGame} bestTimes={{}} />;
  }

  if (screen === "game") {
    return (
      <div style={{ color: "#fff", padding: 40, background: "#0a0a0f", minHeight: "100vh" }}>
        <button onClick={() => setScreen("home")} style={{ color: "#fff", background: "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "8px 16px", cursor: "pointer", marginBottom: 24 }}>
          ← Back
        </button>
        <h2>Playing: {difficulty?.label}</h2>
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Game board goes here</p>
      </div>
    );
  }
}

export default App;