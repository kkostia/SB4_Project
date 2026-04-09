import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "./HomePage";

beforeEach(() => {
    localStorage.clear();
});

// Creating a test that opens the progress dashboard pop up

test("opens progress dashboard pop up", () => {
    render(
        <HomePage
            onStartGame={() => { }}
            streak={3}
            achievements={[]}
            xp={0}
        />
    );

    fireEvent.click(screen.getByText(/Progress Dashboard/i));

    expect(screen.getByText(/Progress Dashboard/i)).toBeInTheDocument();
});

// Creating a test that makes sure the pop up can close

test("closes progress dashboard pop up", () => {
    render(
        <HomePage
            onStartGame={() => { }}
            streak={3}
            achievements={[]}
            xp={0}
        />
    );

    fireEvent.click(screen.getByText(/Progress Dashboard/i));

    fireEvent.click(screen.getByText("✕"));

    expect(screen.queryByText(/Progress Dashboard/i)).not.toBeInTheDocument();
});

// Creating a test that makes sure stats can be displayed from local storage

test("displays stats from localStorage", () => {
    localStorage.setItem(
        "sudoku-results",
        JSON.stringify([
            { difficulty: "easy", elapsed: 120, won: true },
            { difficulty: "easy", elapsed: 150, won: false },
        ])
    );

    render(
        <HomePage
            onStartGame={() => { }}
            streak={2}
            achievements={[]}
            xp={0}
        />
    );

    fireEvent.click(screen.getByText(/Progress Dashboard/i));

    expect(screen.getByText(/Total games/i)).toBeInTheDocument();
    expect(screen.getByText(/Wins/i)).toBeInTheDocument();
});