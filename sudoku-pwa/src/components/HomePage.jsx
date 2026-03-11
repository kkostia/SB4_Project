import { useState } from "react";

const DIFFICULTIES = [
    //API for puzzle generator has only 3 difficulties, so adaptive is just a placeholder for now(will be implemented)
  { id: "easy", label: "Beginner - Easy", clues: 50, tagline: "We need some text here", icon: "○", color: "#34d399", filled: 8 },
  { id: "medium", label: "Intermediate", clues: 32, tagline: "We need some text here", icon: "◉", color: "#fbbf24", filled: 4 },
  { id: "hard", label: "Hard", clues: 24, tagline: "We need some text here", icon: "●", color: "#f87171", filled: 2 },
  { id: "adaptive", label: "Adaptive", clues: 17, tagline: "In development", icon: "⬛", color: "#e879f9", filled: 1, disabled: true },
];

const TIME_LIMITS = [
  { label: "10 sec", seconds: 10 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "∞", seconds: null },
];

function MiniGrid({ filled, color }) {
  const cells = Array.from({ length: 9 });
  const filledSet = new Set();
  while (filledSet.size < filled) filledSet.add(Math.floor(Math.random() * 9));
  const filledArr = [...filledSet];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3px", width: "36px", height: "36px" }}>
      {cells.map((_, i) => (
        <div key={i} style={{ borderRadius: "2px", background: filledArr.includes(i) ? color : "rgba(255,255,255,0.08)" }} />
      ))}
    </div>
  );
}

export default function HomePage({ onStartGame, bestTimes = {} }) {
  const [hovered, setHovered] = useState(null);
  const [selectedTime, setSelectedTime] = useState(TIME_LIMITS[3]); // default: unlimited

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", flexDirection: "column", padding: "0 20px 40px", fontFamily: "sans-serif", maxWidth: "480px", margin: "0 auto" }}>
      
      <header style={{ paddingTop: "56px", paddingBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "28px" }}>⬛</span>
          <span style={{ fontSize: "36px", fontWeight: 800, color: "#fff", letterSpacing: "0.12em" }}>SUDOKU</span>
        </div>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", margin: 0 }}>Train your mind with SUDO</p>
      </header>

      {/* Time limit selector */}
      <div style={{ marginTop: "40px", marginBottom: "28px" }}>
        <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", marginBottom: "12px" }}>
          TIME LIMIT
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {TIME_LIMITS.map((t) => {
            const isSelected = selectedTime.label === t.label;
            return (
              <button
                key={t.label}
                onClick={() => setSelectedTime(t)}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
                  cursor: "pointer", border: "1px solid",
                  borderColor: isSelected ? "#818cf8" : "rgba(255,255,255,0.1)",
                  background: isSelected ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                  color: isSelected ? "#818cf8" : "rgba(255,255,255,0.5)",
                  transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {selectedTime.seconds && (
          <p style={{ fontSize: "11px", color: "rgba(99,102,241,0.7)", margin: "8px 0 0", textAlign: "center" }}>
            ⏱ Timed challenge — solve before the clock runs out!
          </p>
        )}
      </div>

      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", marginTop: "40px", marginBottom: "14px" }}>
        SELECT DIFFICULTY
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {DIFFICULTIES.map((diff) => {
          const isHovered = hovered === diff.id;
          const isDisabled = diff.disabled;

          return (
            <button
              key={diff.id}
              disabled={isDisabled}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 20px", border: "1px solid", borderRadius: "14px",
                cursor: "pointer", width: "100%", textAlign: "left", outline: "none",
                borderColor: isHovered ? diff.color : "rgba(255,255,255,0.07)",
                background: isHovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.025)",
              }}
              onMouseEnter={() => setHovered(diff.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onStartGame(diff, selectedTime.seconds)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "22px", color: diff.color, width: "28px", textAlign: "center" }}>{diff.icon}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>{diff.label}</span>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>{diff.tagline}</span>
                </div>
              </div>
              <MiniGrid filled={diff.filled} color={diff.color} />
            </button>
          );
        })}
      </div>

    </div>
  );
}