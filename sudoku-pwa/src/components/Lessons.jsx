import { useState } from "react";



const LESSONS = [
  
];


export default function Lessons({ onBack }) {
  
 

 

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
};