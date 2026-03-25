import { render, screen } from "@testing-library/react";
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