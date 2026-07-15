import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Home from "./page";

// The page reads Next's app router, which jsdom doesn't provide — stub the
// two pieces useSearchParamsState consumes. Empty params = idle state.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const renderPage = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Home />
    </QueryClientProvider>,
  );

describe("Home", () => {
  it("renders the app heading and the pre-search idle state", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: /freight rate finder/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/enter search parameters to see quotes/i),
    ).toBeInTheDocument();
  });
});
