import { describe, expect, it } from "vitest";

import { quoteSchema } from "../schemas";
import type { RateSearch } from "../types";
import {
  EMPTY_RESULTS_TRIGGER,
  generateQuotes,
  SimulatedUpstreamError,
  UPSTREAM_ERROR_TRIGGER,
} from "./generateQuotes";

const searchWith = (overrides: Partial<RateSearch> = {}): RateSearch => ({
  origin: "Lagos",
  destination: "Rotterdam",
  shipDate: "2027-03-15",
  cargo: { mode: "containers", size: "40ft", quantity: 2 },
  ...overrides,
});

describe("generateQuotes — determinism", () => {
  it("returns identical quotes for the same search", () => {
    expect(generateQuotes(searchWith())).toEqual(generateQuotes(searchWith()));
  });

  it("is insensitive to route casing", () => {
    const shouted = generateQuotes(
      searchWith({ origin: "LAGOS", destination: "ROTTERDAM" }),
    );

    expect(shouted).toEqual(generateQuotes(searchWith()));
  });

  it("changes output when a pricing-relevant field changes", () => {
    const base = generateQuotes(searchWith());
    const differentQuantity = generateQuotes(
      searchWith({ cargo: { mode: "containers", size: "40ft", quantity: 3 } }),
    );
    const differentDate = generateQuotes(searchWith({ shipDate: "2027-03-16" }));

    expect(differentQuantity).not.toEqual(base);
    expect(differentDate).not.toEqual(base);
  });
});

describe("generateQuotes — output invariants", () => {
  const searches = [
    searchWith(),
    searchWith({ origin: "Shanghai", destination: "Hamburg" }),
    searchWith({ cargo: { mode: "loose", pieces: 12, totalWeightKg: 850 } }),
  ];

  it("returns between 3 and 6 quotes", () => {
    for (const search of searches) {
      const count = generateQuotes(search).length;

      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(6);
    }
  });

  it("produces quotes that satisfy the output schema, including the total-equals-sum check", () => {
    for (const search of searches) {
      for (const quote of generateQuotes(search)) {
        expect(() => quoteSchema.parse(quote)).not.toThrow();
      }
    }
  });

  it("never repeats a carrier within one result set", () => {
    for (const search of searches) {
      const carriers = generateQuotes(search).map((quote) => quote.carrier);

      expect(new Set(carriers).size).toBe(carriers.length);
    }
  });
});

describe("generateQuotes — simulation triggers", () => {
  it("throws a simulated upstream error for the error trigger destination, any casing", () => {
    for (const destination of [UPSTREAM_ERROR_TRIGGER, "Atlantis"]) {
      expect(() => generateQuotes(searchWith({ destination }))).toThrow(
        SimulatedUpstreamError,
      );
    }
  });

  it("returns no quotes for the empty trigger destination", () => {
    const quotes = generateQuotes(
      searchWith({ destination: EMPTY_RESULTS_TRIGGER }),
    );

    expect(quotes).toEqual([]);
  });
});
