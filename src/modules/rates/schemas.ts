import { z } from "zod";

export const containerSizeSchema = z.enum(["20ft", "40ft"]);

// Quantities arrive as strings from form inputs and as numbers from JSON
// bodies; coercion lets the exact same schema validate both sources.
export const cargoSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("containers"),
    size: containerSizeSchema,
    quantity: z.coerce
      .number()
      .int("Quantity must be a whole number")
      .min(1, "Quantity must be at least 1")
      .max(500, "Quantity can't exceed 500"),
  }),
  z.object({
    mode: z.literal("loose"),
    pieces: z.coerce
      .number()
      .int("Pieces must be a whole number")
      .min(1, "Pieces must be at least 1")
      .max(10_000, "Pieces can't exceed 10,000"),
    totalWeightKg: z.coerce
      .number()
      .positive("Weight must be greater than 0")
      .max(100_000, "Weight can't exceed 100,000 kg"),
  }),
]);

// "Future" is evaluated against the user's local calendar day: today is
// rejected, tomorrow is the first valid ship date.
const isFutureLocalDate = (isoDate: string): boolean => {
  const [year, month, day] = isoDate.split("-").map(Number);
  const candidate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return candidate.getTime() > today.getTime();
};

export const rateSearchSchema = z.object({
  origin: z.string().trim().min(2, "Enter at least 2 characters"),
  destination: z.string().trim().min(2, "Enter at least 2 characters"),
  shipDate: z.iso
    .date("Enter a valid date")
    .refine(isFutureLocalDate, "Ship date must be in the future"),
  cargo: cargoSchema,
});

export const quoteLineItemSchema = z.object({
  label: z.string().min(1),
  amountCents: z.number().int().nonnegative(),
});

// All money is integer minor units (cents) — no float arithmetic on prices.
export const quoteSchema = z
  .object({
    id: z.string().min(1),
    carrier: z.string().min(1),
    transitDays: z.number().int().positive(),
    lineItems: z.array(quoteLineItemSchema).min(3),
    totalCents: z.number().int().positive(),
    currency: z.enum(["USD"]),
  })
  .refine(
    (quote) =>
      quote.totalCents ===
      quote.lineItems.reduce((sum, item) => sum + item.amountCents, 0),
    {
      error: "totalCents must equal the sum of line item amounts",
      path: ["totalCents"],
    },
  );

export const quotesResponseSchema = z.object({
  quotes: z.array(quoteSchema),
});

export const apiErrorSchema = z.object({
  code: z.enum(["INVALID_INPUT", "UPSTREAM_ERROR"]),
  message: z.string(),
  issues: z
    .array(z.object({ path: z.string(), message: z.string() }))
    .optional(),
});
