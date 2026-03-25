import { useState } from "react";

import nakedSingleImg from "../assets/naked_singles_1.png";
const LESSONS = [
  {
    id: "naked-single",
    title: "Naked Single",
    color: "#34d399",
    tagline: "The most fundamental strategy",
    explanation: "A Naked Single occurs when a cell has only one possible candidate left." + 
                "Every other number (1–9) is already present in the same row, column, or 3×3 box —" +
                " so there is only one number that can legally go there.",
    rule: "If only one number is possible in a cell, it must go there.",
    img: nakedSingleImg,
    imgExp: "Look at cell r6c7: It is not a hidden single. Row 6 has another possible 6 in r6c4, c7" + 
            " and b6 both have another possible 6 in r5c7. But when we examine all cells that can see r6c7, " + 
            "we notice that they contain all digits except 6. 6 is therefore the last possible candidate for r6c7.",
  },
];

export default function Lessons({ onBack }) {
  const [activeLesson, setActiveLesson] = useState(null);

  // Lesson detail view
  if (activeLesson !== null) {
    const lesson = LESSONS[activeLesson];
    return (
      <div style={s.page}>
        {/* Header */}
        <div style={s.header}>
          <button onClick={() => setActiveLesson(null)} style={s.backBtn}>
            ← Back
          </button>
          <span style={{ ...s.lessonBadge, background: lesson.color + "22", color: lesson.color, border: `1px solid ${lesson.color}44` }}>
            {lesson.title}
          </span>
        </div>

        <h2 style={{ fontSize: "var(--font-md)", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px" }}>
          {lesson.title}
        </h2>
        <p style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", margin: "0 0 16px" }}>
          {lesson.tagline}
        </p>

        {/* Rule callout */}
        <div style={{ ...s.card, background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.25)", margin: "12px 0" }}>
          <p style={{ margin: 0, fontSize: "var(--font-sm)", fontWeight: 700, color: "#818cf8" }}>
            📌 The Rule
          </p>
          <p style={{ margin: "6px 0 0", fontSize: "var(--font-sm)", color: "var(--text-primary)" }}>
            {lesson.rule}
          </p>
        </div>

        {/* Explanation */}
        <div style={s.card}>
          <p style={{ margin: 0, fontSize: "var(--font-sm)", color: "var(--text-primary)", lineHeight: 1.7 }}>
            {lesson.explanation}
          </p>
        </div>

        {/* Image Placeholder */}
        <div style={{ marginTop: "24px", marginBottom: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "var(--font-sm)" }}>
            <img 
                src={lesson.img} 
                alt={lesson.title} 
                style={{ width: "100%", height: "auto", display: "block" }} 
            />
        </div>

        {/* Image Explanation */}
        <div style={s.card}>
          <p style={{ margin: 0, fontSize: "var(--font-sm)", color: "var(--text-primary)", lineHeight: 1.7 }}>
            {lesson.imgExp}
          </p>
        </div>
      </div>
    );
  }

  // Lesson list view
  return (
    <div style={s.page}>
      <div style={s.header}>
        <button onClick={onBack} style={s.backBtn}>← Back</button>
      </div>

      <h2 style={{ fontSize: "var(--font-md)", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px" }}>
        Strategy Lessons
      </h2>
      <p style={{ fontSize: "var(--font-sm)", color: "var(--text-muted)", margin: "0 0 24px" }}>
        Learn the logic behind Sudoku — from basics to advanced techniques.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {LESSONS.map((lesson, i) => (
          <button
            key={lesson.id}
            onClick={() => setActiveLesson(i)}
            style={{
              display: "flex", alignItems: "center", gap: "16px",
              padding: "16px 18px", borderRadius: "14px", textAlign: "left",
              background: "var(--bg-surface)", border: "1px solid var(--border-color)",
              cursor: "pointer", width: "100%", outline: "none",
            }}
          >
            <div style={{
              width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
              background: lesson.color + "22", border: `1px solid ${lesson.color}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", fontWeight: 800, color: lesson.color,
            }}>
              {i + 1}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "var(--font-base)", fontWeight: 700, color: "var(--text-primary)" }}>
                {lesson.title}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: "var(--font-sm)", color: "var(--text-muted)" }}>
                {lesson.tagline}
              </p>
            </div>
            <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "18px" }}>›</span>
          </button>
        ))}
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
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "24px",
  },
  backBtn: {
    background: "none", border: "1px solid var(--border-color)",
    borderRadius: "8px", color: "var(--text-primary)",
    padding: "8px 14px", cursor: "pointer", fontSize: "var(--font-sm)",
  },
  lessonBadge: {
    padding: "4px 12px", borderRadius: "20px",
    fontSize: "var(--font-sm)", fontWeight: 700,
  },
  card: {
    background: "var(--bg-surface)", border: "1px solid var(--border-color)",
    borderRadius: "12px", padding: "14px 16px", marginBottom: "0",
  },
};