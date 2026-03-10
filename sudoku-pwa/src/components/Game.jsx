import { useState, useEffect } from "react";
import { checkWin } from "../api/sudokuAPI";

export default function GameBoard({ puzzle, solution, difficulty, onBack }) {
  const [board, setBoard] = useState(puzzle.map(r => [...r]));
  const [selected, setSelected] = useState(null);
  const [won, setWon] = useState(false);

  function handleCellClick(r, c) {
    if (puzzle[r][c] !== 0) return; 
    setSelected([r, c]);
  }

  function handleNumberInput(num) {
    if (!selected) return;
    const [r, c] = selected;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);
    if (checkWin(newBoard, solution)) setWon(true);
  }

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <button onClick={onBack} style={s.backBtn}>← Back</button>
        <span style={s.diffLabel}>{difficulty.label}</span>
      </div>

      {/* Win banner */}
      {won && (
        <div style={s.winBanner}>
          🎉 Solved !
        </div>
      )}

      {/* Grid */}
      <div style={s.grid}>
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
    display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px",
  },
  numBtn: {
    padding: "14px", background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
    color: "#fff", fontSize: "20px", fontWeight: 700, cursor: "pointer",
  },
};