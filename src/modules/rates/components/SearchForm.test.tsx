import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import SearchForm from "./SearchForm";

// SearchForm needs no mocks: it never fetches and never touches the router —
// it only reports a parsed RateSearch through onSubmit.

const isoDateWithOffset = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fillRoute = async () => {
  const user = userEvent.setup();
  await user.type(
    screen.getByPlaceholderText(/enter origin/i),
    "Lagos",
  );
  await user.type(
    screen.getByPlaceholderText(/enter destination/i),
    "Rotterdam",
  );
  // user-event can't type into native date inputs reliably; change works.
  fireEvent.change(document.querySelector('input[name="shipDate"]')!, {
    target: { value: isoDateWithOffset(30) },
  });
  return user;
};

describe("SearchForm", () => {
  it("swaps field sets when the cargo mode radio changes", async () => {
    const user = userEvent.setup();
    render(<SearchForm onSubmit={vi.fn()} />);

    expect(screen.getByText(/container size/i)).toBeInTheDocument();
    expect(screen.queryByText(/number of pieces/i)).not.toBeInTheDocument();

    await user.click(screen.getByText("Loose cargo"));

    expect(screen.getByText(/number of pieces/i)).toBeInTheDocument();
    expect(screen.getByText(/total weight/i)).toBeInTheDocument();
    expect(screen.queryByText(/container size/i)).not.toBeInTheDocument();
  });

  it("shows inline errors and does not submit an empty form", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<SearchForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /search rates/i }));

    expect(
      await screen.findAllByText("Enter at least 2 characters"),
    ).toHaveLength(2);
    expect(screen.getByText("Enter a valid date")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a parsed, coerced RateSearch for a valid containers search", async () => {
    const onSubmit = vi.fn();
    render(<SearchForm onSubmit={onSubmit} />);

    const user = await fillRoute();
    await user.click(screen.getByRole("button", { name: /search rates/i }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        origin: "Lagos",
        destination: "Rotterdam",
        shipDate: isoDateWithOffset(30),
        // quantity arrives as a number, not the DOM's string — the shared
        // schema's coercion at work.
        cargo: { mode: "containers", size: "20ft", quantity: 1 },
      }),
    );
  });

  it("rehydrates loose-cargo defaults from a persisted search", () => {
    render(
      <SearchForm
        defaultValues={{
          origin: "Lagos",
          destination: "Hamburg",
          shipDate: isoDateWithOffset(30),
          cargo: { mode: "loose", pieces: 10, totalWeightKg: 340.5 },
        }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText(/number of pieces/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Lagos")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    expect(screen.getByDisplayValue("340.5")).toBeInTheDocument();
  });
});
