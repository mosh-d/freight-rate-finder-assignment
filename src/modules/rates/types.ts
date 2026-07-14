import type { z } from "zod";

import type {
  apiErrorSchema,
  cargoSchema,
  containerSizeSchema,
  quoteLineItemSchema,
  quoteSchema,
  quotesResponseSchema,
  rateSearchSchema,
} from "./schemas";

export type ContainerSize = z.infer<typeof containerSizeSchema>;
export type Cargo = z.infer<typeof cargoSchema>;
export type RateSearch = z.infer<typeof rateSearchSchema>;
// What the form works with before validation (coercion inputs, pre-trim).
export type RateSearchInput = z.input<typeof rateSearchSchema>;
export type QuoteLineItem = z.infer<typeof quoteLineItemSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type QuotesResponse = z.infer<typeof quotesResponseSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
