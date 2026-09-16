import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScoreBadge } from "./ScoreBadge";

describe("ScoreBadge", () => {
  it("renders green for scores >= 80", () => {
    render(<ScoreBadge score={85} />);

    const badge = screen.getByText("Score: 85");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-green-100", "text-green-700");
  });

  it("renders amber for scores 50-79", () => {
    render(<ScoreBadge score={65} />);

    const badge = screen.getByText("Score: 65");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-amber-100", "text-amber-700");
  });

  it("renders gray for scores < 50", () => {
    render(<ScoreBadge score={30} />);

    const badge = screen.getByText("Score: 30");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-gray-100", "text-gray-700");
  });
});