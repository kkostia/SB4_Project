function parseGrid(data) {
  if (Array.isArray(data)) return data;
  return Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => parseInt(data[r * 9 + c]) || 0)
  );
}

export async function fetchPuzzle(difficulty) {
  const response = await fetch("/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      difficulty: difficulty.id,
      solution: true,
      array: true,
    }),
  });
  if (!response.ok) throw new Error(`Error: ${response.status}`);
  const data = await response.json();
  return {
    puzzle:   parseGrid(data.puzzle),
    solution: parseGrid(data.solution),
  };
}


export function checkWin(board, solution) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] !== solution[r][c]) return false;
  return true;
}
