import { quotesResponseSchema, rateSearchSchema } from "../schemas";
import type { ApiError, QuotesResponse } from "../types";
import {
  generateQuotes,
  SimulatedUpstreamError,
  simulatedLatencyMs,
} from "./generateQuotes";

// Pure request logic, kept separate from the route file so it can be unit
// tested without HTTP. delayMs is returned rather than slept here for the
// same reason — the transport layer decides whether to actually wait.
export type QuotesRequestResult =
  | { status: 200; body: QuotesResponse; delayMs: number }
  | { status: 400 | 500; body: ApiError; delayMs: number };

export const handleQuotesRequest = (payload: unknown): QuotesRequestResult => {
  const parsed = rateSearchSchema.safeParse(payload);

  if (!parsed.success) {
    return {
      status: 400,
      // Invalid input fails fast: no simulated latency on validation errors.
      delayMs: 0,
      body: {
        code: "INVALID_INPUT",
        message: "The search request is invalid.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.map(String).join("."),
          message: issue.message,
        })),
      },
    };
  }

  const delayMs = simulatedLatencyMs(parsed.data);

  try {
    const quotes = generateQuotes(parsed.data);

    // Re-validated on the way out so a bug in generation can never ship an
    // inconsistent payload (wrong shape or line items that don't sum).
    return {
      status: 200,
      delayMs,
      body: quotesResponseSchema.parse({ quotes }),
    };
  } catch (error) {
    if (error instanceof SimulatedUpstreamError) {
      return {
        status: 500,
        delayMs,
        body: { code: "UPSTREAM_ERROR", message: error.message },
      };
    }
    throw error;
  }
};
