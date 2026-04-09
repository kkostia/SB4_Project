import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePage from "./HomePage";

beforeEach(() => {
    localStorage.clear();
});

const defaultProps = {
    onStartGame: jest.fn(),
    lastResult: null,
    bestTimes: {},
    theme: "dark",
    onSetTheme: jest.fn(),
    largeFont: false,
    onToggleFontSize: jest.fn(),
    soundEnabled: false,
    onToggleSound: jest.fn(),
    streak: 3,
    achievements: [],
    xp: 0,
};

test("opens progress dashboard pop up", () => {
    render(<HomePage {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Progress Dashboard/i }));

    expect(
        screen.getByRole("heading", { name: /Progress Dashboard/i })
    ).toBeInTheDocument();
});

test("closes progress dashboard pop up", () => {
    render(<HomePage {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Progress Dashboard/i }));

    expect(
        screen.getByRole("heading", { name: /Progress Dashboard/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "✕" }));

    expect(
        screen.queryByRole("heading", { name: /Progress Dashboard/i })
    ).not.toBeInTheDocument();
});

test("displays stats from localStorage", () => {
    localStorage.setItem(
        "sudoku-results",
        JSON.stringify([
            { difficulty: "easy", elapsed: 120, won: true },
            { difficulty: "easy", elapsed: 150, won: false },
        ])
    );

    render(<HomePage {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Progress Dashboard/i }));

    expect(screen.getByText(/Total games:/i)).toBeInTheDocument();
    expect(screen.getByText(/Wins:/i)).toBeInTheDocument();
    expect(screen.getByText(/Win rate:/i)).toBeInTheDocument();
});