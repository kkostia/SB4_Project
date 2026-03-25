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

    test("moves to the next step when Next is clicked", () => {
        render(<Tutorial onClose={() => {}} />);

        fireEvent.click(screen.getByRole("button", { name: /Next/i }));

        expect(
            screen.getByText(/Check digits present in its ROW/i)
        ).toBeInTheDocument();
    });

    test("moves to the previous step when Prev is clicked", () => {
        render(<Tutorial onClose={() => {}} />);

        fireEvent.click(screen.getByRole("button", { name: /Next/i}));
        fireEvent.click(screen.getByRole("button", { name: /Prev/i }));

        expect(
            screen.getByText(/Look at the highlighted cell/i)
        ).toBeInTheDocument();
    });
});