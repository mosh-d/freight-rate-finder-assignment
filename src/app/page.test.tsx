import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("renders the app heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /freight rate finder/i }),
    ).toBeInTheDocument();
  });
});
