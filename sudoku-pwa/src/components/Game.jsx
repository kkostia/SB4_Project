import { useState, useEffect, } from "react";
import { checkWin } from "../api/sudokuAPI";

export default function GameBoard({ puzzle, solution, difficulty, timeLimit, onBack, onGameEnd }) {
  const [board, setBoard] = useState(puzzle.map(r => [...r]));
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  
  const maxMistakes = 5;
  const challengeMode = true;
  const isTimed = typeof timeLimit === "number" && timeLimit > 0;
  const isOver = won || timedOut;

  

  // Single simple timer: always counts elapsed seconds up
  useEffect(() => {
    if (isOver) return;
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [isOver]);

  // Timeout check: when elapsed reaches timeLimit, trigger timeout
  useEffect(() => {
    if (isTimed && elapsed >= timeLimit && !won) {
      setTimedOut(true);
    }
  }, [elapsed, isTimed, timeLimit, won]);

  // Display value: countdown if timed, count-up if unlimited
  const displaySeconds = isTimed ? Math.max(0, timeLimit - elapsed) : elapsed;
  const timerColor = isTimed && displaySeconds <= 30 ? "#f87171" : "#fff";

  function handleCellClick(r, c) {
    if (isOver) return;
    if (puzzle[r][c] !== 0) return; // given cell, can't change
    setSelected([r, c]);
  }

  function handleNumberInput(num) {
    if (!selected || isOver) return;
    const [r, c] = selected;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);
    if (checkWin(newBoard, solution)) {
      setWon(true);
      onGameEnd({ difficulty: difficulty.id, elapsed: elapsed, won: true });
    }
  }

  // Creating a reset function to start over if needed
  function handleReset() {
    setBoard(puzzle.map(row => [...row]));
    setSelected(null);
    setElapsed(0);
    setWon(false);
    setTimedOut(false);
  }

  function handleUndo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setBoard(prev);
    setHistory(h => h.slice(0, -1));
    setWon(false);
  }

  function handleUndo() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setBoard(prev);
    setHistory(h => h.slice(0, -1));
    setWon(false);
  }

  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }


  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <button onClick={onBack} style={s.backBtn}>← Back</button>

        {/* Reset button */}
        <button onClick={handleReset} style={s.backBtn}>Reset</button>

        {/* TEMP: cheat button for testing — remove before commit */}
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={() => { setWon(true); onGameEnd({ difficulty: difficulty.id, elapsed: 42, won: true }); }}
            style={{ background: "red", color: "#fff", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "11px" }}
          >
            WIN
          </button>
        )}
        <span style={s.diffLabel}>{difficulty.label}</span>
        <span style={{ ...s.timer, color: timerColor }}>
          {isTimed ? `⏱ ${formatTime(displaySeconds)}` : formatTime(displaySeconds)}
        </span>
      </div>

      {/* Win banner */}
      {won && (
        <div style={s.winBanner}>
          🎉 Solved in {formatTime(elapsed)}!
        </div>
      )}

      {/* Timeout banner */}
      {timedOut && (
        <div style={s.timeoutBanner}>
          ⏰ Time's up! Better luck next time.
          <button onClick={onBack} style={s.tryAgainBtn}>Try Again</button>
        </div>
      )}

      {/* Grid */}
      <div style={{ ...s.grid, opacity: timedOut ? 0.4 : 1, pointerEvents: timedOut ? "none" : "auto" }}>
        {board.map((row, r) =>
          row.map((val, c) => {
            const isSelected = selected?.[0] === r && selected?.[1] === c;
            const isGiven = puzzle[r][c] !== 0;
            const isWrong = val !== 0 && val !== solution[r][c];
            const thickRight = (c + 1) % 3 === 0 && c !== 8;
            const thickBottom = (r + 1) % 3 === 0 && r !== 8;

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                style={{
                  ...s.cell,
                  background: isSelected ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.03)",
                  color: isWrong ? "#f87171" : isGiven ? "#fff" : "#818cf8",
                  fontWeight: isGiven ? 700 : 400,
                  borderRight: thickRight ? "2px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  borderBottom: thickBottom ? "2px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  cursor: isGiven ? "default" : "pointer",
                }}
              >
                {val !== 0 ? val : ""}
              </div>
            );
          })
        )}
      </div>

      {/* Number pad */}
      <div style={s.numpad}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} style={s.numBtn} onClick={() => handleNumberInput(n)}>
            {n}
          </button>
        ))}
        <button style={s.numBtn} onClick={() => handleNumberInput(0)}>✕</button>
      </div>

    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh", background: "#0a0a0f", color: "#fff",
    fontFamily: "sans-serif", padding: "20px", maxWidth: "480px", margin: "0 auto",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px",
  },
  backBtn: {
    background: "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px",
    color: "#fff", padding: "8px 14px", cursor: "pointer", fontSize: "14px",
  },
  diffLabel: { fontSize: "16px", fontWeight: 700, color: "rgba(255,255,255,0.6)" },
  timer: { fontSize: "22px", fontWeight: 800, fontVariantNumeric: "tabular-nums" },
  winBanner: {
    background: "rgba(52,211,153,0.15)", border: "1px solid #34d399", borderRadius: "12px",
    padding: "14px", textAlign: "center", fontSize: "18px", fontWeight: 700,
    color: "#34d399", marginBottom: "16px",
  },
  timeoutBanner: {
    background: "rgba(248,113,113,0.15)", border: "1px solid #f87171", borderRadius: "12px",
    padding: "14px", textAlign: "center", fontSize: "18px", fontWeight: 700,
    color: "#f87171", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px",
  },
  tryAgainBtn: {
    background: "rgba(248,113,113,0.2)", border: "1px solid #f87171", borderRadius: "8px",
    color: "#f87171", padding: "8px 20px", cursor: "pointer", fontSize: "14px", fontWeight: 700,
    alignSelf: "center",
  },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(9, 1fr)",
    border: "2px solid rgba(255,255,255,0.2)", borderRadius: "12px", overflow: "hidden",
    aspectRatio: "1", marginBottom: "16px",
  },
  cell: {
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "clamp(14px, 3.5vw, 20px)", userSelect: "none",
  },
  numpad: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px",
  },
  numBtn: {
    padding: "14px", background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
    color: "#fff", fontSize: "20px", fontWeight: 700, cursor: "pointer",
  },
};