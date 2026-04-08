const RANKS = [
  { name: "Beginner", minXP: 0 },
  { name: "Novice", minXP: 50 },
  { name: "Solver", minXP: 150 },
  { name: "Expert", minXP: 400 },
  { name: "Master", minXP: 800 },
  { name: "Grandmaster", minXP: 1500 },
];

const XP_PER_DIFFICULTY = {
  easy: 10,
  medium: 25,
  hard: 50,
};

export function getXP() {
  return Number(localStorage.getItem("sudoku-xp")) || 0;
}

export function addXP(amount) {
  const current = getXP();
  const updated = current + amount;
  localStorage.setItem("sudoku-xp", updated);
  return updated;
}

export function calcXPForGame(difficulty, elapsed, won) {
  if (!won) return 0;
  const base = XP_PER_DIFFICULTY[difficulty] || 10;
  return base;
}

export function getRank(xp) {
  let current = RANKS[0];
  let nextRank = RANKS[1];

  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) {
      current = RANKS[i];
      nextRank = RANKS[i + 1] || null;
      break;
    }
  }

  const level = Math.floor(xp / 50) + 1;

  return {
    name: current.name,
    level,
    minXP: current.minXP,
    nextXP: nextRank ? nextRank.minXP : null,
    nextName: nextRank ? nextRank.name : null,
  };
}
