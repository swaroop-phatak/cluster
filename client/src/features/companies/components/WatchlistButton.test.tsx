import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { WatchlistButton } from "./WatchlistButton";

const mockNavigate = vi.fn();
const mockAdd = vi.fn();
const mockRemove = vi.fn();

let mockUser: { id: string } | null = {
  id: "user-1",
};

let mockWatchlist: { companyId: string }[] = [];

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../../store/useAuthStore", () => ({
  useAuthStore: (selector: (state: { user: typeof mockUser }) => unknown) =>
    selector({ user: mockUser }),
}));

vi.mock("../../watchlists/api", () => ({
  useWatchlist: () => ({
    data: mockWatchlist,
  }),

  useAddToWatchlist: () => ({
    mutate: mockAdd,
    isPending: false,
    isError: false,
    error: null,
  }),

  useRemoveFromWatchlist: () => ({
    mutate: mockRemove,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

describe("WatchlistButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUser = {
      id: "user-1",
    };

    mockWatchlist = [];
  });

  it("adds a company when it is not watchlisted", () => {
    render(<WatchlistButton companyId="company-1" />);

    const button = screen.getByRole("button", {
      name: "+ Add to Watchlist",
    });

    expect(button).toBeInTheDocument();

    button.click();

    expect(mockAdd).toHaveBeenCalledWith("company-1");
    expect(mockRemove).not.toHaveBeenCalled();
  });

  it("removes a company when it is already watchlisted", () => {
    mockWatchlist = [{ companyId: "company-1" }];

    render(<WatchlistButton companyId="company-1" />);

    const button = screen.getByRole("button", {
      name: "✓ Watchlisted",
    });

    expect(button).toBeInTheDocument();

    button.click();

    expect(mockRemove).toHaveBeenCalledWith("company-1");
    expect(mockAdd).not.toHaveBeenCalled();
  });
});