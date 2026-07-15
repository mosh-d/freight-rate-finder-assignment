// useQuotesQuery — TanStack Query owns the quotes request. Plan notes (commit 9):
//   useQuery({ queryKey: ["quotes", search], enabled: search !== null })
//   queryFn: POST /api/quotes with the search as JSON body;
//     - res.ok    → parse through quotesResponseSchema before returning (trust boundary)
//     - !res.ok   → parse body through apiErrorSchema and throw it (typed error
//                   surface for QuotesError to render; keep the thrown shape consistent)
// The search object goes straight in the key — TanStack hashes object keys with
// stable key ordering, so structurally equal searches share a cache entry.
"use client";

import { useQuery } from "@tanstack/react-query";
import { quotesResponseSchema, apiErrorSchema } from "../schemas";
import type { ApiError, QuotesResponse, RateSearch } from "../types";

export function useQuotesQuery(search: RateSearch | null) {
  // Typing the error side means consumers get ApiError | Error without casts.
  return useQuery<QuotesResponse, ApiError | Error>({
    queryKey: ["quotes", search],
    queryFn: async () => {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(search),
      });

      if (!res.ok) {
        const body = await res.json();
        const parsedError = apiErrorSchema.safeParse(body);
        if (parsedError.success) {
          throw parsedError.data;
        }
        throw new Error("Failed to fetch quotes");
      }

      const body = await res.json();
      const parsed = quotesResponseSchema.safeParse(body);
      if (!parsed.success) {
        throw new Error("Invalid quotes response");
      }
      return parsed.data;
    },
    enabled: search !== null,
  });
}
