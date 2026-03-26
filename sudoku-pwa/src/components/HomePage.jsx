import { useState } from "react";
import logo from "../assets/logoSUDO.svg";
import TutorialModal from "./Tutorial";

const DIFFICULTIES = [
  //API for puzzle generator has only 3 difficulties, so adaptive is just a placeholder for now(will be implemented)
  {
    id: "easy",
    label: "Beginner - Easy",
    clues: 50,
    tagline: "Great for beginners, plenty of clues",
    icon: "○",
    color: "#34d399",
    filled: 8,
  },
  {
    id: "medium",
    label: "Intermediate",
    clues: 32,
    tagline: "A solid challenge for regular players",
    icon: "◉",
    color: "#fbbf24",
    filled: 4,
  },
  {
    id: "hard",
    label: "Hard",
    clues: 24,
    tagline: "For experienced solvers only",
    icon: "●",
    color: "#f87171",
    filled: 2,
  },
  {
    id: "adaptive",
    label: "Adaptive",
    clues: 17,
    tagline: "In development",
    icon: "⬛",
    color: "#e879f9",
    filled: 1,
    disabled: true,
  },
];

const TIME_LIMITS = [
  { label: "3 min", seconds: 180 },
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "3px",
        width: "36px",
        height: "36px",
      }}
    >
      {cells.map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: "2px",
            background: filledArr.includes(i) ? color : "var(--border-color)",
          }}
        />
      ))}
    </div>
  );
}

// Adding a function to get performance stats
function getPerformanceStats(lastResult) {
  if (!lastResult) return null;

  const results = JSON.parse(localStorage.getItem("sudoku-results") || "[]");

  const sameDifficultyWins = results.filter(
    (game) => game.difficulty === lastResult.difficulty && game.won
  );

  if (sameDifficultyWins.length === 0) return null;

  const times = sameDifficultyWins.map((game) => game.elapsed);
  const bestTime = Math.min(...times);
  const averageTime = Math.round(
    times.reduce((sum, time) => sum + time, 0) / times.length
  );

  return {
    gamesPlayed: sameDifficultyWins.length,
    bestTime,
    averageTime,
  };
}

export default function HomePage({
  onStartGame,
  lastResult,
  bestTimes = {},
  theme,
  onSetTheme,
  largeFont,
  onToggleFontSize,
  soundEnabled,
  onToggleSound,
  streak = 0,
  achievements = [],
}) {

  const [showTutorial, setShowTutorial] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [selectedTime, setSelectedTime] = useState(TIME_LIMITS[3]); // default: unlimited

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        padding: "0 20px 40px",
        fontFamily: "sans-serif",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      <header style={{ paddingTop: "56px", paddingBottom: "8px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "6px",
          }}

        > <img src={logo} alt="Sudoku Logo" className="logo" />

          <span className="title">SUDO</span>

        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {[
            { id: "dark", color: "#0a0a0f", border: "#555" },
            { id: "light", color: "#f3f4f6", border: "#ccc" },
            { id: "ocean", color: "#0c1a2e", border: "#38bdf8" },
            { id: "forest", color: "#0a1a0f", border: "#34d399" },
            { id: "sunset", color: "#1a0a0a", border: "#fb7185" },
            { id: "purple", color: "#0f0a1a", border: "#a78bfa" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => onSetTheme(t.id)}
              title={t.id}
              style={{
                width: "22px", height: "22px", borderRadius: "50%",
                background: t.color, cursor: "pointer",
                border: theme === t.id ? `2px solid ${t.border}` : "2px solid transparent",
                outline: theme === t.id ? `2px solid ${t.border}` : "none",
                padding: 0,
              }}
            />
          ))}
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "16px",
          padding: "8px 12px",
          background: "rgba(251, 191, 36, 0.1)",
          borderRadius: "8px",
          width: "fit-content",
          border: "1px solid rgba(251, 191, 36, 0.3)"
        }}>
          <span style={{ fontSize: "20px" }}>🔥</span>
          <span style={{ fontWeight: 800, color: "#fbbf24", fontSize: "18px" }}>{streak}</span>
          <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>STREAK</span>
        </div>

        {achievements.length > 0 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "12px",
            padding: "8px 12px",
            background: "rgba(168, 85, 247, 0.1)",
            borderRadius: "8px",
            width: "fit-content",
            border: "1px solid rgba(168, 85, 247, 0.3)"
          }}>
            <span style={{ fontSize: "20px" }}>🏆</span>
            <span style={{ fontWeight: 800, color: "#a855f7", fontSize: "18px" }}>{achievements.length}</span>
            <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 600 }}>ACHIEVEMENTS</span>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <button
            onClick={onToggleFontSize}
            aria-label="Toggle large font size"
            style={{
              background: "none",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: "var(--font-base)",
              fontWeight: 700,
            }}
          >
            {largeFont ? "A−" : "A+"}
          </button>

          {/*sound toggle button */}
          <button
            onClick={onToggleSound}
            aria-label="Toggle sound"
            style={{
              background: "none",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: "var(--font-base)",
            }}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
        </div>
        <p
          style={{
            fontSize: "var(--font-sm)",
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          Train your mind with SUDO
        </p>
      </header>

      {lastResult &&
        (() => {
          const order = ["easy", "medium", "hard"];
          const idx = order.indexOf(lastResult.difficulty);
          const next = order[idx + 1];
          const mins = Math.floor(lastResult.elapsed / 60);
          const secs = lastResult.elapsed % 60;
          const timeStr = `${mins}m ${secs}s`;
          const nextDiff = DIFFICULTIES.find((d) => d.id === next);
          const performanceStats = getPerformanceStats(lastResult);

          return (
            <div
              style={{
                margin: "24px 0 0",
                padding: "14px 16px",
                borderRadius: "12px",
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--font-sm)",
                  color: "var(--text-muted)",
                }}
              >
                LAST GAME
              </p>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: lastResult.won ? "var(--text-primary)" : "#f87171",
                }}
              >
                {lastResult.won ? "✅" : "❌"}{" "}
                {
                  DIFFICULTIES.find((d) => d.id === lastResult.difficulty)
                    ?.label
                }{" "}
                {lastResult.won ? ` difficulty solved in ${timeStr}` : `difficulty lost after ${timeStr}`}
              </p>

              {/* Performance UI */}
              {performanceStats && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <p style={{ margin: "0 0 6px", fontWeight: 700 }}>
                    Performance Comparison
                  </p>

                  <p style={{ margin: 0 }}>
                    Games played: {performanceStats.gamesPlayed}
                  </p>

                  <p style={{ margin: 0 }}>
                    Best time: {Math.floor(performanceStats.bestTime / 60)}m{" "}
                    {performanceStats.bestTime % 60}s
                  </p>

                  <p style={{ margin: 0 }}>
                    Average time: {Math.floor(performanceStats.averageTime / 60)}m{" "}
                    {performanceStats.averageTime % 60}s
                  </p>
                </div>
              )}

              {nextDiff && (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "var(--font-sm)",
                    color: "#818cf8",
                  }}
                >
                  💡 Ready for a bigger challenge? Try{" "}
                  <strong>{nextDiff.label}</strong> next!
                </p>
              )}
              {!nextDiff && (
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "var(--font-sm)",
                    color: "#f59e0b",
                  }}
                >
                  🏆 You've conquered the hardest level!
                </p>
              )}
            </div>
          );
        })()}

      {/* Time limit selector */}
      <div style={{ marginTop: "40px", marginBottom: "28px" }}>
        <div
          style={{
            fontSize: "var(--font-sm)",
            color: "var(--text-muted)",
            letterSpacing: "0.2em",
            marginBottom: "12px",
          }}
        >
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
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: "10px",
                  fontSize: "var(--font-base)",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: isSelected ? "#818cf8" : "rgba(255,255,255,0.1)",
                  background: isSelected
                    ? "rgba(99,102,241,0.2)"
                    : "rgba(255,255,255,0.03)",
                  color: isSelected ? "#818cf8" : "var(--text-muted)",
                  transition: "all 0.15s",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {selectedTime.seconds && (
          <p
            style={{
              fontSize: "11px",
              color: "rgba(99,102,241,0.7)",
              margin: "8px 0 0",
              textAlign: "center",
            }}
          >
            ⏱ Timed challenge — solve before the clock runs out!
          </p>
        )}
      </div>

      {/* lessons entry point */}
      <button
        onClick={() => setShowTutorial(true)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", borderRadius: "14px", textAlign: "left",
          background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.25)",
          cursor: "pointer", width: "100%", marginBottom: "10px", outline: "none",
          color: "#818cf8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px" }}>📖</span>
          <div>
            <p style={{ margin: 0, fontSize: "var(--font-base)", fontWeight: 700 }}>Strategy Lessons</p>
            <p style={{ margin: "2px 0 0", fontSize: "var(--font-sm)", color: "var(--text-muted)" }}>
              Learn Naked Singles, Hidden Singles and more
            </p>
          </div>
        </div>
        <span style={{ fontSize: "18px" }}>›</span>
      </button>
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

      <div
        style={{
          fontSize: "var(--font-sm)",
          color: "var(--text-muted)",
          letterSpacing: "0.2em",
          marginTop: "40px",
          marginBottom: "14px",
        }}
      >
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
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px",
                border: "1px solid",
                borderRadius: "14px",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                outline: "none",
                borderColor: isHovered ? diff.color : "var(--border-color)",
                background: isHovered
                  ? "var(--bg-surface)"
                  : "var(--bg-surface)",
              }}
              onMouseEnter={() => setHovered(diff.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onStartGame(diff, selectedTime.seconds)}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <span
                  style={{
                    fontSize: "22px",
                    color: diff.color,
                    width: "28px",
                    textAlign: "center",
                  }}
                >
                  {diff.icon}
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--font-md)",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                  >
                    {diff.label}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--font-sm)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {diff.tagline}
                  </span>
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
