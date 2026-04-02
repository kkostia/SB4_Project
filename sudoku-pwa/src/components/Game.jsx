import { useState, useEffect } from "react";
import { checkWin } from "../api/sudokuAPI";
import { markPlayedToday } from "./HomePage";

export default function GameBoard({
  puzzle,
  solution,
  difficulty,
  timeLimit,
  onBack,
  onGameEnd,
  largeFont,
  soundEnabled,
}) {
  const [board, setBoard] = useState(puzzle.map((r) => [...r]));
  const [selected, setSelected] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [won, setWon] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [paused, setPaused] = useState(false);

  // Creating the history state to check mistake history
  const [mistakeHistory, setMistakeHistory] = useState([]);

  //hint state
  const [hint, setHint] = useState(null);
  const [hintLevel, setHintLevel] = useState(0); // 0=none 1=cell 2=strategy 3=answer
  const [hintsUsed, setHintsUsed] = useState(0);

  // starting hints depend on difficulty
  const HINTS_BY_DIFFICULTY = { easy: 5, medium: 3, hard: 1, adaptive: 2 };
  const initialMaxHints = HINTS_BY_DIFFICULTY[difficulty.id] ?? 3;
  const [maxHints, setMaxHints] = useState(initialMaxHints);

  const maxMistakes = 5;
  const challengeMode = true;
  const isTimed = typeof timeLimit === "number" && timeLimit > 0;
  const isOver = won || timedOut;

  useEffect(() => {
    markPlayedToday();
  }, []);
  
  // Single simple timer: always counts elapsed seconds up
  useEffect(() => {
    if (isOver || paused) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isOver, paused]);

  // reduce available hints by 1 every 3 minutes to encourage independence
  useEffect(() => {
    if (isOver || paused) return;
    const reductions = Math.floor(elapsed / 180); // 180 seconds = 3 minutes
    const newMax = Math.max(0, initialMaxHints - reductions);
    if (newMax < maxHints) {
      setMaxHints(newMax);
    }
  }, [elapsed, isOver, paused, initialMaxHints, maxHints]);

  // Timeout check: when elapsed reaches timeLimit, trigger timeout
  useEffect(() => {
    if (isTimed && elapsed >= timeLimit && !won) {
      setTimedOut(true);
      playSound("timeout");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, isTimed, timeLimit, won]);

  // Display value: countdown if timed, count-up if unlimited
  const displaySeconds = isTimed ? Math.max(0, timeLimit - elapsed) : elapsed;
  const timerColor = isTimed && displaySeconds <= 30 ? "#f87171" : "#fff";

  function handleCellClick(r, c) {
    if (isOver || paused) return;
    if (puzzle[r][c] !== 0) return;
    setSelected([r, c]);
  }

  function handleNumberInput(num) {
    if (!selected || isOver || paused) return;
    setHint(null);
    setHintLevel(0); // reset progressive hint on new input
    const [r, c] = selected;
    if (puzzle[r][c] !== 0) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);
    if (!challengeMode || num === solution[r][c]) playSound("correct");// sound for correct move (only when not wrong)

    // Checking if a move is wrong in challenge mdoe
    if (challengeMode && num !== solution[r][c] && num !== 0) {
      const newMistakes = mistakes + 1;
      playSound("wrong");
      setMistakes(newMistakes);

      // Adding to mistake history
      setMistakeHistory((prev) => [
        {
          row: r + 1,
          col: c + 1,
          entered: num,
          correct: solution[r][c],
        },
        ...prev,
      ]);

      if (newMistakes >= maxMistakes) {
        setTimedOut(true);
        onGameEnd({
          difficulty: difficulty.id,
          elapsed: elapsed,
          won: false,
        });
        return;
      }
    }

    if (checkWin(newBoard, solution)) {
      setWon(true);
      playSound("win");
      onGameEnd({ difficulty: difficulty.id, elapsed: elapsed, won: true });
    }
  }

  // Creating a reset function to start over if needed
  function handleReset() {
    setBoard(puzzle.map((row) => [...row]));
    setSelected(null);
    setElapsed(0);
    setWon(false);
    setTimedOut(false);
    setMistakes(0);
    setMistakeHistory([]);
    setHint(null);
    setHintLevel(0);
    setHintsUsed(0);
    setMaxHints(initialMaxHints);  // reset adaptive cap on restart
  }


  // hint logic — tries Naked Single then Hidden Single
  function getHint() {
    if (isOver || paused) return;

    // Levels 2 and 3 are free — just advance the level
    if (hintLevel === 1) { setHintLevel(2); return; }
    if (hintLevel === 2) { setHintLevel(3); return; }

    // If we are at level 3 and click again, reset to level 0 so we can try to buy a new hint
    if (hintLevel === 3) {
      setHintLevel(0);
      setHint(null);
      // Allow the function to continue to the "Level 0->1" logic below
    }

    // Level 0→1: compute hint and cost 1 hint
    if (hintsUsed >= maxHints) return;

    // Helper: get all values present in a row
    const rowVals = (r) => new Set(board[r].filter(v => v !== 0));
    // Helper: get all values present in a column
    const colVals = (c) => new Set(board.map(row => row[c]).filter(v => v !== 0));
    // Helper: get all values present in a 3x3 box
    const boxVals = (r, c) => {
      const br = Math.floor(r / 3) * 3;
      const bc = Math.floor(c / 3) * 3;
      const vals = new Set();
      for (let i = br; i < br + 3; i++)
        for (let j = bc; j < bc + 3; j++)
          if (board[i][j] !== 0) vals.add(board[i][j]);
      return vals;
    };
    // Helper: get candidates for a cell
    const getCandidates = (r, c) => {
      if (board[r][c] !== 0) return [];
      const used = new Set([...rowVals(r), ...colVals(c), ...boxVals(r, c)]);
      return [1,2,3,4,5,6,7,8,9].filter(n => !used.has(n));
    };

    // Strategy 1: Naked Single — only one candidate for a cell
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== 0) continue;
        const candidates = getCandidates(r, c);
        if (candidates.length === 1) {
          const value = candidates[0];
          setHint({
            row: r, col: c, value,
            strategy: "Naked Single",
            explanation: `This cell can only be ${candidates[0]} — every other number already appears in its row, column, or box.`,
          });
          setHintLevel(1);
          setHintsUsed(h => h + 1);
          setSelected([r, c]);
          return;
        }
      }
    }

    // Strategy 2: Hidden Single — a number has only one valid cell in a row/col/box
    for (let num = 1; num <= 9; num++) {
      // Check each row
      for (let r = 0; r < 9; r++) {
        const cells = [];
        for (let c = 0; c < 9; c++)
          if (board[r][c] === 0 && getCandidates(r, c).includes(num)) cells.push([r, c]);
        if (cells.length === 1) {
          const [hr, hc] = cells[0];
          setHint({
            row: hr, col: hc, value: num,
            strategy: "Hidden Single",
            explanation: `${num} must go in this cell — it's the only place in row ${hr + 1} where ${num} can legally go.`,
          });
          setHintLevel(1);
          setHintsUsed(h => h + 1);
          setSelected([hr, hc]);
          return;
        }
      }
      // Check each column
      for (let c = 0; c < 9; c++) {
        const cells = [];
        for (let r = 0; r < 9; r++)
          if (board[r][c] === 0 && getCandidates(r, c).includes(num)) cells.push([r, c]);
        if (cells.length === 1) {
          const [hr, hc] = cells[0];
          setHint({
            row: hr, col: hc, value: num,
            strategy: "Hidden Single",
            explanation: `${num} must go in this cell — it's the only place in column ${hc + 1} where ${num} can legally go.`,
          });
          setHintLevel(1);
          setHintsUsed(h => h + 1);
          setSelected([hr, hc]);
          return;
        }
      }
      // Check each box
      for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
          const cells = [];
          for (let r = br * 3; r < br * 3 + 3; r++)
            for (let c = bc * 3; c < bc * 3 + 3; c++)
              if (board[r][c] === 0 && getCandidates(r, c).includes(num)) cells.push([r, c]);
          if (cells.length === 1) {
            const [hr, hc] = cells[0];
            setHint({
              row: hr, col: hc, value: num,
              strategy: "Hidden Single",
              explanation: `${num} must go in this cell — it's the only place in this 3×3 box where ${num} can legally go.`,
            });
            setHintLevel(1);
            setHintsUsed(h => h + 1);
            setSelected([hr, hc]);
            return;
          }
        }
      }
    }

    // No hint found (puzzle may need advanced strategies)
    setHint({
      row: null, col: null, value: null,
      strategy: "No hint available",
      explanation: "No beginner-level hint found. Try scanning each row and column for missing numbers."});
      setHintLevel(1);
  }

  // ADDED: Web Audio sound effects
  function playSound(type) {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "correct") {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "wrong") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === "win") {
        [523, 659, 784, 1047].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
          g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.2);
          o.start(ctx.currentTime + i * 0.12);
          o.stop(ctx.currentTime + i * 0.12 + 0.2);
        });
      } else if (type === "timeout") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {}
  }

  function formatTime(s) {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  return (
    <div className={largeFont ? "home-large-font" : ""} style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button onClick={onBack} style={s.backBtn}>
          ← Back
        </button>

        {/* Reset button */}
        <button onClick={handleReset} style={s.backBtn}>
          Reset
        </button>
        {!isOver && (
          <button onClick={() => setPaused((p) => !p)} style={s.backBtn}>
            {paused ? "Resume" : "Pause"}
          </button>
        )}
        
        {/* TEMP: cheat button for testing — remove before commit */}
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={() => {
              setWon(true);
              playSound("win");
              onGameEnd({ difficulty: difficulty.id, elapsed: 42, won: true });
            }}
            style={{
              background: "red",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: "11px",
            }}
          >
            WIN
          </button>
        )}
        <span style={s.diffLabel}>{difficulty.label}</span>
        <span style={s.diffLabel}>
          Mistakes: {mistakes}/{maxMistakes}
        </span>
        <span style={{ ...s.timer, color: timerColor }}>
          {isTimed
            ? `⏱ ${formatTime(displaySeconds)}`
            : formatTime(displaySeconds)}
        </span>
      </div>

      {/* Win banner */}
      {won && (
        <div style={s.winBanner}>🎉 Solved in {formatTime(elapsed)}!</div>
      )}

      {/* Timeout banner */}
      {timedOut && (
        <div style={s.timeoutBanner}>
          ⏰ Time's up! Better luck next time.
          <button onClick={onBack} style={s.tryAgainBtn}>
            Try Again
          </button>
        </div>
      )}

      {/* Grid */}
      <div
        style={{
          ...s.grid,
          opacity: timedOut || paused ? 0.4 : 1,
          pointerEvents: timedOut || paused ? "none" : "auto",
          filter: paused ? "blur(4px)" : "none",
        }}
      >
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
                  background: hint && hint.row === r && hint.col === c
                    ? "rgba(229, 251, 36, 0.35)"
                    : isSelected
                      ? "rgba(99,102,241,0.35)"
                      : "var(--bg-surface)",
                  color: isWrong
                    ? "#f87171"
                    : isGiven
                      ? "var(--text-primary)"
                      : "#818cf8",
                  fontWeight: isGiven ? 700 : 400,
                  borderRight: thickRight
                    ? "2px solid var(--border-color-thick)"
                    : "1px solid var(--border-color)",
                  borderBottom: thickBottom
                    ? "2px solid var(--border-color-thick)"
                    : "1px solid var(--border-color)",
                  cursor: isGiven ? "default" : "pointer",
                }}
              >
                {val !== 0 ? val : ""}
              </div>
            );
          }),
        )}
      </div>

     {/* Progressive Hint banner */}
      {hint && hintLevel >= 1 && (
        <div style={{
          background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.4)",
          borderRadius: "12px", padding: "12px 16px", marginBottom: "16px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "var(--font-sm)", fontWeight: 700, color: "#fbbf24", letterSpacing: "0.1em" }}>
              {hintLevel === 1 ? "💡 Check the highlighted cell" : `💡 ${hint.strategy}`}
            </span>
            <button onClick={() => { setHint(null); setHintLevel(0); }} style={{
              background: "none", border: "none", color: "var(--text-muted)",
              cursor: "pointer", fontSize: "16px", padding: "0 4px",
            }}>✕</button>
          </div>

          {/* Level 1: cell highlighted only — just a nudge */}
          {hintLevel === 1 && (
            <p style={{ margin: 0, fontSize: "var(--font-sm)", color: "var(--text-primary)", lineHeight: 1.5 }}>
              A cell has been highlighted. Try to figure out the value yourself first!
            </p>
          )}

          {/* Level 2: show strategy + explanation but not the value */}
          {hintLevel >= 2 && (
            <p style={{ margin: 0, fontSize: "var(--font-sm)", color: "var(--text-primary)", lineHeight: 1.5 }}>
              {hint.explanation}
            </p>
          )}

          {/* Level 3: reveal the answer */}
          {hintLevel === 3 && hint.value && (
            <p style={{ margin: "8px 0 0", fontSize: "var(--font-sm)", fontWeight: 700, color: "#fbbf24" }}>
              Answer: {hint.value}
            </p>
          )}
        </div>
      )}

      {/* Hint button */}
      {!isOver && (
        <button
          onClick={getHint}
          disabled={hintsUsed >= maxHints && (hintLevel === 0 || hintLevel === 3)}
          style={{
            width: "100%", padding: "12px", marginBottom: "12px",
            // Logic for background color
            background: (hintsUsed >= maxHints && (hintLevel === 0 || hintLevel === 3)) 
              ? "rgba(255,255,255,0.03)" 
              : "rgba(251,191,36,0.1)",
            // Logic for border color
            border: `1px solid ${(hintsUsed >= maxHints && (hintLevel === 0 || hintLevel === 3)) 
              ? "var(--border-color)" 
              : "rgba(251,191,36,0.4)"}`,
            borderRadius: "10px", 
            // Logic for cursor
            cursor: (hintsUsed >= maxHints && (hintLevel === 0 || hintLevel === 3)) 
              ? "not-allowed" 
              : "pointer",
            // Logic for text color
            color: (hintsUsed >= maxHints && (hintLevel === 0 || hintLevel === 3)) 
              ? "var(--text-muted)" 
              : "#fbbf24",
            fontSize: "var(--font-sm)", fontWeight: 700,
          }}
        >
          {hintLevel === 0 && `💡 Get a hint (${Math.max(0, maxHints - hintsUsed)} remaining)`}
          {hintLevel === 1 && "💡 Show me why →"}
          {hintLevel === 2 && "💡 Show me the answer →"}
          {hintLevel === 3 && `💡 New hint (${Math.max(0, maxHints - hintsUsed)} remaining)`}
          {maxHints < initialMaxHints && (
            <span style={{ fontSize: "11px", opacity: 0.6, marginLeft: "6px" }}>
              (reduced from {initialMaxHints} — keep going!)
            </span>
          )}
        </button>
      )}

      {/* Mistake history */}
<div
  style={{
    background: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "16px",
  }}
>
  <div
    style={{
      fontSize: "var(--font-base)",
      fontWeight: 700,
      marginBottom: "8px",
      color: "var(--text-primary)",
    }}
  >
    Mistake History
  </div>

  {mistakeHistory.length === 0 ? (
    <p
      style={{
        margin: 0,
        color: "var(--text-muted)",
        fontSize: "var(--font-sm)",
      }}
    >
      No mistakes yet.
    </p>
  ) : (
    <ul
      style={{
        margin: 0,
        paddingLeft: "18px",
        color: "var(--text-primary)",
        fontSize: "var(--font-sm)",
      }}
    >
      {mistakeHistory.map((mistake, index) => (
        <li key={index} style={{ marginBottom: "6px" }}>
          Row {mistake.row}, Col {mistake.col}: entered {mistake.entered}, correct was {mistake.correct}
        </li>
      ))}
    </ul>
  )}
</div>

      {/* Number pad */}
      <div style={s.numpad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} style={s.numBtn} onClick={() => handleNumberInput(n)}>
            {n}
          </button>
        ))}
        <button style={s.numBtn} onClick={() => handleNumberInput(0)}>
          ✕
        </button>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    fontFamily: "sans-serif",
    padding: "20px",
    maxWidth: "480px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  backBtn: {
    background: "none",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    color: "var(--text-primary)",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: "var(--font-sm)",
  },
  diffLabel: {
    fontSize: "var(--font-base)",
    fontWeight: 700,
    color: "var(--text-muted)",
  },
  timer: {
    fontSize: "var(--font-lg)",
    fontWeight: 800,
    fontVariantNumeric: "tabular-nums",
  },
  winBanner: {
    background: "rgba(52,211,153,0.15)",
    border: "1px solid #34d399",
    borderRadius: "12px",
    padding: "14px",
    textAlign: "center",
    fontSize: "var(--font-md)",
    fontWeight: 700,
    color: "#34d399",
    marginBottom: "16px",
  },
  timeoutBanner: {
    background: "rgba(248,113,113,0.15)",
    border: "1px solid #f87171",
    borderRadius: "12px",
    padding: "14px",
    textAlign: "center",
    fontSize: "var(--font-md)",
    fontWeight: 700,
    color: "#f87171",
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  tryAgainBtn: {
    background: "rgba(248,113,113,0.2)",
    border: "1px solid #f87171",
    borderRadius: "8px",
    color: "#f87171",
    padding: "8px 20px",
    cursor: "pointer",
    fontSize: "var(--font-sm)",
    fontWeight: 700,
    alignSelf: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(9, 1fr)",
    border: "2px solid rgba(255,255,255,0.2)",
    borderRadius: "12px",
    overflow: "hidden",
    aspectRatio: "1",
    marginBottom: "16px",
  },
  cell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "clamp(14px, 3.5vw, 20px)",
    userSelect: "none",
  },
  numpad: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
  },
  numBtn: {
    padding: "14px",
    background: "var(--bg-surface)",
    border: "1px solid var(--border-color)",
    borderRadius: "10px",
    color: "var(--text-primary)",
    fontSize: "var(--font-lg)",
    fontWeight: 700,
    cursor: "pointer",
  },
};
