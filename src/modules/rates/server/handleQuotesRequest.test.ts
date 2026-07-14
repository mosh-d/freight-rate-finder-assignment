import { describe, expect, it } from "vitest";

import { quotesResponseSchema } from "../schemas";
import { handleQuotesRequest } from "./handleQuotesRequest";

const validSearch = {
  origin: "Lagos",
  destination: "Rotterdam",
  shipDate: "2027-03-15",
  cargo: { mode: "containers", size: "40ft", quantity: 2 },
};

describe("handleQuotesRequest", () => {
  it("returns 200 with schema-valid quotes and seeded latency for a valid search", () => {
    const result = handleQuotesRequest(validSearch);

    expect(result.status).toBe(200);
    expect(() => quotesResponseSchema.parse(result.body)).not.toThrow();
    expect(result.delayMs).toBeGreaterThanOrEqual(400);
    expect(result.delayMs).toBeLessThanOrEqual(900);
  });

  it("returns 400 with field-level issues for invalid input, without latency", () => {
    const result = handleQuotesRequest({
      ...validSearch,
      origin: "L",
      cargo: { mode: "containers", size: "40ft", quantity: 0 },
    });

    expect(result).toMatchObject({
      status: 400,
      delayMs: 0,
      body: { code: "INVALID_INPUT" },
    });
    expect(result.status === 400 ? result.body.issues : []).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "origin" }),
        expect.objectContaining({ path: "cargo.quantity" }),
      ]),
    );
  });

  it("returns 400 for a null payload, as produced by malformed JSON", () => {
    expect(handleQuotesRequest(null).status).toBe(400);
  });

  it("maps the simulated upstream failure to a typed 500", () => {
    const result = handleQuotesRequest({
      ...validSearch,
      destination: "Jupiter",
    });

    expect(result).toMatchObject({
      status: 500,
      body: { code: "UPSTREAM_ERROR" },
    });
  });
});
