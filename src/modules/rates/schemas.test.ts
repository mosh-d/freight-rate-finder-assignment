import { describe, expect, it } from "vitest";

import { quoteSchema, rateSearchSchema } from "./schemas";

const isoDateWithOffset = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const validContainerSearch = {
  origin: "Lagos",
  destination: "Rotterdam",
  shipDate: isoDateWithOffset(1),
  cargo: { mode: "containers", size: "40ft", quantity: 2 },
};

const validLooseSearch = {
  ...validContainerSearch,
  cargo: { mode: "loose", pieces: 10, totalWeightKg: 340.5 },
};

describe("rateSearchSchema — cargo modes", () => {
  it("accepts a valid containers search", () => {
    expect(rateSearchSchema.safeParse(validContainerSearch).success).toBe(true);
  });

  it("accepts a valid loose cargo search", () => {
    expect(rateSearchSchema.safeParse(validLooseSearch).success).toBe(true);
  });

  it("rejects containers mode carrying only loose-cargo fields", () => {
    const result = rateSearchSchema.safeParse({
      ...validContainerSearch,
      cargo: { mode: "containers", pieces: 10, totalWeightKg: 340 },
    });

    expect(result.success).toBe(false);
  });

  it("rejects loose mode carrying only container fields", () => {
    const result = rateSearchSchema.safeParse({
      ...validContainerSearch,
      cargo: { mode: "loose", size: "20ft", quantity: 1 },
    });

    expect(result.success).toBe(false);
  });

  it("strips fields from the other mode instead of leaking them through", () => {
    const result = rateSearchSchema.parse({
      ...validContainerSearch,
      cargo: { ...validContainerSearch.cargo, pieces: 99 },
    });

    expect(result.cargo).not.toHaveProperty("pieces");
  });

  it("coerces numeric strings from form inputs", () => {
    const result = rateSearchSchema.parse({
      ...validContainerSearch,
      cargo: { mode: "containers", size: "20ft", quantity: "3" },
    });

    expect(result.cargo).toEqual({
      mode: "containers",
      size: "20ft",
      quantity: 3,
    });
  });

  it("rejects zero and non-integer quantities", () => {
    for (const quantity of [0, 1.5]) {
      const result = rateSearchSchema.safeParse({
        ...validContainerSearch,
        cargo: { mode: "containers", size: "20ft", quantity },
      });

      expect(result.success).toBe(false);
    }
  });
});

describe("rateSearchSchema — ship date", () => {
  it("rejects today and past dates, accepts tomorrow", () => {
    for (const [offset, expected] of [
      [-1, false],
      [0, false],
      [1, true],
    ] as const) {
      const result = rateSearchSchema.safeParse({
        ...validContainerSearch,
        shipDate: isoDateWithOffset(offset),
      });

      expect(result.success).toBe(expected);
    }
  });

  it("rejects malformed dates", () => {
    for (const shipDate of ["not-a-date", "2026-13-01", "01/02/2026"]) {
      const result = rateSearchSchema.safeParse({
        ...validContainerSearch,
        shipDate,
      });

      expect(result.success).toBe(false);
    }
  });
});

describe("quoteSchema — output contract", () => {
  const validQuote = {
    id: "q-1",
    carrier: "Maersk",
    transitDays: 21,
    lineItems: [
      { label: "Base freight", amountCents: 100_000 },
      { label: "Fuel surcharge", amountCents: 20_000 },
      { label: "Handling", amountCents: 5_000 },
    ],
    totalCents: 125_000,
    currency: "USD",
  };

  it("accepts a quote whose total equals the sum of line items", () => {
    expect(quoteSchema.safeParse(validQuote).success).toBe(true);
  });

  it("rejects a quote whose total does not match its line items", () => {
    const result = quoteSchema.safeParse({ ...validQuote, totalCents: 999 });

    expect(result.success).toBe(false);
  });

  it("rejects a quote with fewer than 3 line items", () => {
    const result = quoteSchema.safeParse({
      ...validQuote,
      lineItems: validQuote.lineItems.slice(0, 2),
      totalCents: 120_000,
    });

    expect(result.success).toBe(false);
  });
});
