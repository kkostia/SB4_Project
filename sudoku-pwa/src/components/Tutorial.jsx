import { useState, useEffect, useRef } from "react";

// Strategy data
const STRATEGIES = [
  {
    id: "naked-single",
    title: "Naked Single",
    badge: "BEGINNER",
    badgeColor: "#34d399",
    icon: "①",
    tagline: "When only one number can go in a cell",
    description:
      "A naked single occurs when a cell has only one possible candidate. Every other digit already appears in the same row, column, or 3×3 box.",
    tip: "Scan each empty cell and eliminate the digits already present in its row, column, and box. If only one digit remains, place it!",
    steps: [
      {
        label: "Look at the highlighted cell (row 5, col 5).",
        highlight: { cell: [4, 4] },
        annotation: "?",
      },
      {
        label: "Check digits present in its ROW — 1, 2, 3, 4 are taken.",
        highlight: { cell: [4, 4], row: 4 },
        eliminated: [1, 2, 3, 4],
        annotation: "Row check",
      },
      {
        label: "Check its COLUMN — 5, 6, 7 are also present.",
        highlight: { cell: [4, 4], col: 4 },
        eliminated: [1, 2, 3, 4, 5, 6, 7],
        annotation: "Col check",
      },
      {
        label: "Check its BOX — 8 is present too.",
        highlight: { cell: [4, 4], box: [3, 3] },
        eliminated: [1, 2, 3, 4, 5, 6, 7, 8],
        annotation: "Box check",
      },
      {
        label: "Only 9 remains — place it with confidence! ✓",
        highlight: { cell: [4, 4] },
        eliminated: [1, 2, 3, 4, 5, 6, 7, 8],
        solved: true,
        annotation: "9",
      },
    ],
    // A minimal 9×9 board (0 = empty)
    board: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 2, 3, 1, 0, 6, 7, 5, 0],  // row 4 — cell [4,4] is the naked single (=9)
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
  },
  {
    id: "hidden-single",
    title: "Hidden Single",
    badge: "BEGINNER",
    badgeColor: "#34d399",
    icon: "②",
    tagline: "A digit fits in only one cell of a unit",
    description:
      "A hidden single is when a particular digit can only go into one cell within a row, column, or box — even though that cell might have other candidates.",
    tip: "Pick a digit (1–9) and ask: in this row/column/box, where could it possibly go? If only one cell is open, that's your hidden single!",
    steps: [
      {
        label: "Focus on the 3rd box (top-right). Where can 9 go?",
        highlight: { box: [0, 6] },
        annotation: "Find 9",
      },
      {
        label: "9 is in row 1 already → removes top row of the box.",
        highlight: { box: [0, 6], row: 0 },
        eliminated: [],
        annotation: "Row 1 blocks",
      },
      {
        label: "9 is in row 3 already → removes bottom row of the box.",
        highlight: { box: [0, 6], row: 2 },
        annotation: "Row 3 blocks",
      },
      {
        label: "Only [1,8] remains in the box for 9 — place it! ✓",
        highlight: { cell: [1, 8] },
        solved: true,
        annotation: "9",
      },
    ],
    board: [
      [5, 3, 0, 0, 7, 0, 0, 0, 9],
      [6, 0, 0, 1, 0, 5, 0, 0, 0],  // [1,8] is the hidden single
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 2, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 9, 7, 0],
    ],
  },
  {
    id: "elimination",
    title: "Box / Line Reduction",
    badge: "INTERMEDIATE",
    badgeColor: "#fbbf24",
    icon: "③",
    tagline: "Constrain candidates across boxes using lines",
    description:
      "If a candidate in a box is limited to a single row or column, that digit can be eliminated from the rest of that row or column outside the box.",
    tip: "Find a digit confined to one row/col within a box. Then cross out that digit from the rest of that row/col beyond the box.",
    steps: [
      {
        label: "In the top-left box, 7 can only appear in row 2 (r=1).",
        highlight: { box: [0, 0], row: 1 },
        annotation: "7 locked in row 2",
      },
      {
        label: "Therefore 7 is eliminated from row 2 cells outside this box.",
        highlight: { row: 1 },
        annotation: "Eliminate 7 →",
      },
      {
        label: "This unlocks new naked singles elsewhere in row 2. ✓",
        highlight: { row: 1 },
        solved: true,
        annotation: "Chain reaction!",
      },
    ],
    board: [
      [0, 3, 5, 0, 0, 4, 0, 0, 0],
      [0, 7, 0, 0, 0, 0, 5, 0, 0],  // row 1 — 7 locked in top-left box
      [0, 0, 0, 7, 0, 0, 0, 8, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 0, 3, 0, 0, 4, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 8, 0, 0, 0, 7, 0, 0, 0],
      [0, 0, 5, 0, 0, 0, 0, 7, 0],
      [0, 0, 0, 4, 0, 0, 8, 0, 0],
    ],
  },
];

// Mini Sudoku grid renderer
function MiniBoard({ board, stepInfo, solved }) {
  const { highlight = {}, annotation } = stepInfo || {};

  function isCellHighlighted(r, c) {
    if (highlight.cell) return highlight.cell[0] === r && highlight.cell[1] === c;
    return false;
  }

  function isRowHighlighted(r) {
    return highlight.row === r;
  }

  function isColHighlighted(c) {
    return highlight.col === c;
  }

  function isBoxHighlighted(r, c) {
    if (!highlight.box) return false;
    const [br, bc] = highlight.box;
    return r >= br && r < br + 3 && c >= bc && c < bc + 3;
  }

  function getCellBg(r, c) {
    if (isCellHighlighted(r, c)) return solved ? "rgba(52,211,153,0.45)" : "rgba(99,102,241,0.55)";
    if (isRowHighlighted(r) || isColHighlighted(c)) return "rgba(251,191,36,0.18)";
    if (isBoxHighlighted(r, c)) return "rgba(251,191,36,0.12)";
    return "rgba(255,255,255,0.04)";
  }

  function getCellBorder(r, c) {
    const thickRight = (c + 1) % 3 === 0 && c !== 8;
    const thickBottom = (r + 1) % 3 === 0 && r !== 8;
    return {
      borderRight: thickRight ? "1.5px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.1)",
      borderBottom: thickBottom ? "1.5px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.1)",
    };
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(9, 1fr)",
      border: "2px solid rgba(255,255,255,0.25)",
      borderRadius: "10px",
      overflow: "hidden",
      aspectRatio: "1",
      width: "100%",
      maxWidth: "300px",
      margin: "0 auto",
    }}>
      {board.map((row, r) =>
        row.map((val, c) => {
          const isTarget = highlight.cell && highlight.cell[0] === r && highlight.cell[1] === c;
          const showAnnotation = isTarget && annotation;

          return (
            <div
              key={`${r}-${c}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "clamp(9px, 2vw, 13px)",
                fontWeight: val !== 0 ? 700 : 400,
                background: getCellBg(r, c),
                color: isTarget
                  ? solved ? "#34d399" : "#818cf8"
                  : val !== 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
                transition: "background 0.3s, color 0.3s",
                fontFamily: "'DM Mono', monospace",
                ...getCellBorder(r, c),
              }}
            >
              {showAnnotation ? (
                <span style={{
                  fontWeight: 900,
                  fontSize: "clamp(10px, 2.5vw, 15px)",
                  color: solved ? "#34d399" : "#c4b5fd",
                  textShadow: solved ? "0 0 8px #34d39988" : "0 0 8px #818cf888",
                }}>
                  {annotation}
                </span>
              ) : val !== 0 ? val : ""}
            </div>
          );
        })
      )}
    </div>
  );
}
// Marks
function Marks({ eliminated }) {
  if (!eliminated || eliminated.length === 0) return null;
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
      {[1,2,3,4,5,6,7,8,9].map(n => {
        const isOut = eliminated.includes(n);
        return (
          <span key={n} style={{
            width: "28px", height: "28px",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "6px",
            fontSize: "13px", fontWeight: 700,
            fontFamily: "'DM Mono', monospace",
            background: isOut ? "rgba(248,113,113,0.12)" : "rgba(99,102,241,0.2)",
            color: isOut ? "rgba(248,113,113,0.4)" : "#818cf8",
            textDecoration: isOut ? "line-through" : "none",
            border: `1px solid ${isOut ? "rgba(248,113,113,0.2)" : "rgba(99,102,241,0.3)"}`,
            transition: "all 0.3s",
          }}>
            {n}
          </span>
        );
      })}
    </div>
  );
}

// Progress dots
function StepDots({ total, current }) {
  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center", margin: "12px 0" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? "20px" : "8px",
          height: "8px",
          borderRadius: "4px",
          background: i < current ? "#34d399"
            : i === current ? "#818cf8"
            : "rgba(255,255,255,0.15)",
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );
}

// Main Tutorial
export default function Tutorial({ onClose, initialStrategy = null }) {
  const [activeStrategy, setActiveStrategy] = useState(
    initialStrategy ?? STRATEGIES[0].id
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const replayRef = useRef(null);
  const overlayRef = useRef(null);

  const strategy = STRATEGIES.find(s => s.id === activeStrategy);
  const safeStepIndex = Math.min(stepIndex, strategy.steps.length - 1);
  const currentStep = strategy.steps[safeStepIndex];
  const isLast = stepIndex === strategy.steps.length - 1;
  const isFirst = stepIndex === 0;

  // Reset step when strategy changes
  useEffect(() => {
    setStepIndex(0);
    setIsReplaying(false);
  }, [activeStrategy]);

  // Replay: auto-advance steps
  function startReplay() {
    setStepIndex(0);
    setIsReplaying(true);
  }

  useEffect(() => {
    if (!isReplaying) return;
    if (stepIndex >= strategy.steps.length - 1) {
      setIsReplaying(false);
      return;
    }
    replayRef.current = setTimeout(() => {
      setStepIndex(i => i + 1);
    }, 1800);
    return () => clearTimeout(replayRef.current);
  }, [isReplaying, stepIndex, strategy.steps.length]);

  // Dismiss on overlay click
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <div style={{
        width: "100%", maxWidth: "480px",
        maxHeight: "92vh",
        overflowY: "auto",
        background: "linear-gradient(160deg, #131320 0%, #0d0d18 100%)",
        border: "1px solid rgba(99,102,241,0.3)",
        borderRadius: "20px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em",
                color: "#818cf8", background: "rgba(99,102,241,0.15)",
                padding: "3px 8px", borderRadius: "4px",
              }}>
                STRATEGIES
              </span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                • {STRATEGIES.indexOf(strategy) + 1} of {STRATEGIES.length}
              </span>
            </div>
            <h2 style={{
              margin: 0, fontSize: "22px", fontWeight: 800,
              color: "#fff", letterSpacing: "-0.02em",
            }}>
              {strategy.icon} {strategy.title}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
              {strategy.tagline}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", color: "rgba(255,255,255,0.7)",
              width: "32px", height: "32px", cursor: "pointer",
              fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Strategy tabs ── */}
        <div style={{
          display: "static", gap: "12px", padding: "15px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          {STRATEGIES.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveStrategy(s.id)}
              style={{
                flexShrink: 0,
                padding: "12px 12px",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: activeStrategy === s.id ? s.badgeColor : "rgba(255,255,255,0.1)",
                background: activeStrategy === s.id ? `${s.badgeColor}18` : "transparent",
                color: activeStrategy === s.id ? s.badgeColor : "rgba(255,255,255,0.4)",
                fontSize: "12px", fontWeight: 700, cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {s.icon} {s.title}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "20px", flex: 1 }}>

          {/* Description */}
          <p style={{
            margin: "0 0 16px",
            fontSize: "14px", lineHeight: "1.6",
            color: "rgba(255,255,255,0.65)",
          }}>
            {strategy.description}
          </p>

          {/* Board */}
          <MiniBoard
            board={strategy.board}
            stepInfo={currentStep}
            solved={currentStep.solved}
          />

          {/* Step dots */}
          <StepDots total={strategy.steps.length} current={stepIndex} />

          {/* Step label */}
          <div style={{
            margin: "0 0 12px",
            padding: "12px 14px",
            background: currentStep.solved
              ? "rgba(52,211,153,0.08)"
              : "rgba(99,102,241,0.08)",
            border: `1px solid ${currentStep.solved ? "rgba(52,211,153,0.25)" : "rgba(99,102,241,0.2)"}`,
            borderRadius: "10px",
            fontSize: "14px", fontWeight: 600,
            color: currentStep.solved ? "#34d399" : "rgba(255,255,255,0.85)",
            lineHeight: "1.5",
            transition: "all 0.3s",
            minHeight: "48px",
          }}>
            <span style={{ marginRight: "8px", opacity: 0.6, fontSize: "12px" }}>
              STEP {stepIndex + 1}/{strategy.steps.length}
            </span>
            {currentStep.label}
          </div>

          {/* Marks */}
          <Marks eliminated={currentStep.eliminated} />

          {/* Tip box */}
          <div style={{
            marginTop: "16px",
            padding: "12px 14px",
            background: "rgba(251,191,36,0.06)",
            border: "1px solid rgba(251,191,36,0.2)",
            borderRadius: "10px",
            fontSize: "13px", color: "rgba(251,191,36,0.85)",
            lineHeight: "1.5",
          }}>
            💡 <strong>Pro tip:</strong> {strategy.tip}
          </div>
        </div>

        {/* ── Footer controls ── */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex", gap: "8px", alignItems: "center",
        }}>
          {/* Replay — Story 20 */}
          <button
            onClick={startReplay}
            disabled={isReplaying}
            title="Replay this tutorial from the start"
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(99,102,241,0.4)",
              background: isReplaying ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.1)",
              color: "#818cf8",
              fontSize: "13px", fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "6px",
              transition: "all 0.2s",
              opacity: isReplaying ? 0.6 : 1,
            }}
          >
            {isReplaying ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>↻</span>
                Replaying…
              </>
            ) : (
              <> ↺ Replay </>
            )}
          </button>

          <div style={{ flex: 1 }} />

          {/* Prev */}
          <button
            onClick={() => setStepIndex(i => Math.max(0, i - 1))}
            disabled={isFirst || isReplaying}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              color: isFirst ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.8)",
              fontSize: "13px", fontWeight: 700,
              cursor: isFirst ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >
            ← Prev
          </button>

          {/* Next / Done */}
          <button
            onClick={() => {
              if (isLast) {
                // Cycle to next strategy or close
                const idx = STRATEGIES.findIndex(s => s.id === activeStrategy);
                const next = STRATEGIES[idx + 1];
                if (next) { setActiveStrategy(next.id); }
                else { onClose(); }
              } else {
                setStepIndex(i => i + 1);
              }
            }}
            disabled={isReplaying}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              background: isLast
                ? "linear-gradient(135deg, #34d399, #059669)"
                : "linear-gradient(135deg, #818cf8, #6366f1)",
              color: "#fff",
              fontSize: "13px", fontWeight: 800,
              cursor: "pointer",
              boxShadow: isLast
                ? "0 4px 16px rgba(52,211,153,0.35)"
                : "0 4px 16px rgba(99,102,241,0.35)",
              transition: "all 0.2s",
              opacity: isReplaying ? 0.5 : 1,
            }}
          >
            {isLast
              ? (STRATEGIES.findIndex(s => s.id === activeStrategy) < STRATEGIES.length - 1
                  ? "Next Strategy →"
                  : "Finish ✓")
              : "Next →"}
          </button>
        </div>

        {/* Replay spin animation */}
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}