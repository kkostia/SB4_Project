import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Tutorial from "./Tutorial";

describe("Tutorial strategy lessons", () => {
    test("renders the default strategy", () => {
        render(<Tutorial onClose={() => {}} />);
        expect(screen.getByText(/Naked Single/i)).toBeInTheDocument();
    });

    test("shows the first step by default", () => {
        render(<Tutorial onClose={() => {}} />);
        expect(
            screen.getByText(/Look at the highlighted cell/i)
        ).toBeInTheDocument();
    });

    
})