import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import GameBoard from "./Game";

// Creating the mock props to test the mistake history
const mockProps = {
    puzzle: Array(9).fill(Array(9).fill(0)),
    solution: Array(9).fill(Array(9).fill(1)),
    difficulty: {id: "easy", label: "Easy"},
    timeLimit: null,
    onBack: jest.fn(),
    onGameEnd: jest.fn(),
    largeFont: false,
    soundEnabled: false,
};

describe("Mistake History feature", () => {
    test("renders mistake history section", () => {
        render(<GameBoard {...mockProps} />);

        expect(screen.getByText(/Mistake History/i)).toBeInTheDocument();
    });

    test("shows 'No mistakes yet' initially", () => {
        render(<GameBoard {...mockProps} />);

        expect(screen.getByText(/No mistakes yet/i)).toBeInTheDocument();
    });
});

// ── Shared helpers ──────────────────────────────────────────────────────────
 
const baseProps = {
  puzzle: Array(9).fill(Array(9).fill(0)),
  solution: Array(9).fill(Array(9).fill(1)),
  timeLimit: null,
  onBack: jest.fn(),
  onGameEnd: jest.fn(),
  largeFont: false,
  soundEnabled: false,
};
 
function makeProps(difficultyId) {
  return {
    ...baseProps,
    difficulty: { id: difficultyId, label: difficultyId },
  };
}
 
// ── SCRUM-37: Adaptive Hints ─────────────────────────────────────────────────
 
describe("SCRUM-37: Adaptive hints reduce over time", () => {
 
  // 1. Correct starting counts per difficulty
  describe("Starting hint count based on difficulty", () => {
    test("Easy starts with 5 hints", () => {
      render(<GameBoard {...makeProps("easy")} />);
      expect(screen.getByText(/5 remaining/i)).toBeInTheDocument();
    });
 
    test("Medium starts with 3 hints", () => {
      render(<GameBoard {...makeProps("medium")} />);
      expect(screen.getByText(/3 remaining/i)).toBeInTheDocument();
    });
 
    test("Hard starts with 1 hint", () => {
      render(<GameBoard {...makeProps("hard")} />);
      expect(screen.getByText(/1 remaining/i)).toBeInTheDocument();
    });
  });
 
  // 2. Hint count reduces after 3 minutes
  describe("Hint count reduces every 3 minutes", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());
 
    test("Easy: reduces from 5 to 4 after 3 minutes", () => {
      render(<GameBoard {...makeProps("easy")} />);
 
      // Advance 3 minutes (180 seconds)
      act(() => { jest.advanceTimersByTime(180_000); });
 
      expect(screen.getByText(/4 remaining/i)).toBeInTheDocument();
    });
 
    test("Easy: reduces from 5 to 3 after 6 minutes", () => {
      render(<GameBoard {...makeProps("easy")} />);
 
      act(() => { jest.advanceTimersByTime(360_000); });
 
      expect(screen.getByText(/3 remaining/i)).toBeInTheDocument();
    });
 
    test("Medium: reduces from 3 to 2 after 3 minutes", () => {
      render(<GameBoard {...makeProps("medium")} />);
 
      act(() => { jest.advanceTimersByTime(180_000); });
 
      expect(screen.getByText(/2 remaining/i)).toBeInTheDocument();
    });
 
    test("Hard: reduces from 1 to 0 after 3 minutes", () => {
      render(<GameBoard {...makeProps("hard")} />);
 
      act(() => { jest.advanceTimersByTime(180_000); });
 
      expect(screen.getByText(/0 remaining/i)).toBeInTheDocument();
    });
  });
 
  // 3. Hint count never goes below 0
  describe("Hint count floor at 0", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());
 
    test("Hard: does not go below 0 after many minutes", () => {
      render(<GameBoard {...makeProps("hard")} />);
 
      // Advance 30 minutes — far beyond any reduction
      act(() => { jest.advanceTimersByTime(1_800_000); });
 
      expect(screen.getByText(/0 remaining/i)).toBeInTheDocument();
      expect(screen.queryByText(/-\d remaining/i)).not.toBeInTheDocument();
    });
  });
 
  // 4. Hint button is disabled when hints reach 0
  describe("Hint button disabled when no hints left", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());
 
    test("Hard: hint button is disabled after 3 minutes", () => {
      render(<GameBoard {...makeProps("hard")} />);
 
      act(() => { jest.advanceTimersByTime(180_000); });
 
      const hintButton = screen.getByRole("button", { name: /hint/i });
      expect(hintButton).toBeDisabled();
    });
 
    test("Easy: hint button is still enabled after 3 minutes (4 remaining)", () => {
      render(<GameBoard {...makeProps("easy")} />);
 
      act(() => { jest.advanceTimersByTime(180_000); });
 
      const hintButton = screen.getByRole("button", { name: /hint/i });
      expect(hintButton).not.toBeDisabled();
    });
  });
 
  // 5. Hint count does not reduce while paused
  describe("Hint count does not reduce while paused", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());
 
    test("Medium: hints stay at 3 after 3 minutes while paused", async () => {
      
      render(<GameBoard {...makeProps("medium")} />);
 
      // Pause the game
      const pauseButton = screen.getByRole("button", { name: /pause/i });
      userEvent.click(pauseButton);
 
      // Advance 3 minutes while paused
      act(() => { jest.advanceTimersByTime(180_000); });
 
      // Should still show 3 — timer was paused so no reduction
      expect(screen.getByText(/3 remaining/i)).toBeInTheDocument();
    });
  });
 
  // 6. Hint count resets on game reset
  describe("Hint count resets when game resets", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());
 
    test("Easy: hints restore to 5 after reset", async () => {
      
      render(<GameBoard {...makeProps("easy")} />);
 
      // Advance 6 minutes — hints reduce to 3
      act(() => { jest.advanceTimersByTime(360_000); });
      expect(screen.getByText(/3 remaining/i)).toBeInTheDocument();
 
      // Reset the game
      const resetButton = screen.getByRole("button", { name: /reset/i });
      userEvent.click(resetButton);
 
      // Should be back to 5
      expect(screen.getByText(/5 remaining/i)).toBeInTheDocument();
    });
  });
 
  // 7. Reduced hint message shown to user
  describe("Reduced hint message encourages independence", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());
 
    test("Shows reduction message after hints decrease", () => {
      render(<GameBoard {...makeProps("easy")} />);
 
      act(() => { jest.advanceTimersByTime(180_000); });
 
      expect(screen.getByText(/keep going/i)).toBeInTheDocument();
    });
 
    test("Does not show reduction message at game start", () => {
      render(<GameBoard {...makeProps("easy")} />);
 
      expect(screen.queryByText(/keep going/i)).not.toBeInTheDocument();
    });
  });
 
});