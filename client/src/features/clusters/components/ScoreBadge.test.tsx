import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScoreBadge } from "./ScoreBadge";

describe("ScoreBadge", () => {
  it("renders green for scores >= 80", () => {
    render(<ScoreBadge score={87} />);

    const badge = screen.getByText("Score: 87");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-green-100", "text-green-800");
    expect(badge).toHaveClass("border-green-600", "border-2");
  });

  it("renders amber for scores 50-79", () => {
    render(<ScoreBadge score={65} />);

    const badge = screen.getByText("Score: 65");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-amber-100", "text-amber-800");
    expect(badge).toHaveClass("border-amber-600", "border-2");
  });

  it("renders black and white for scores < 50", () => {
    render(<ScoreBadge score={40} />);

    const badge = screen.getByText("Score: 40");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("bg-white", "text-black");
    expect(badge).toHaveClass("border-black", "border-2");
  });
});