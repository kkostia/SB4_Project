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


