import type { Quote, RateSearch } from "../types";

// Documented simulation triggers (matched case-insensitively on destination):
// searching to Jupiter fails like an upstream outage, Nowhere returns no quotes.
export const UPSTREAM_ERROR_TRIGGER = "jupiter";
export const EMPTY_RESULTS_TRIGGER = "nowhere";

export class SimulatedUpstreamError extends Error {
  constructor() {
    super("The upstream rates provider is unavailable for this destination.");
    this.name = "SimulatedUpstreamError";
  }
}

const CARRIERS = [
  "Maersk Line",
  "MSC",
  "CMA CGM",
  "Hapag-Lloyd",
  "Evergreen Marine",
  "ONE Ocean Network",
];

const fnv1a = (input: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index++) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number) => (): number => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// The canonical form of a search: an explicit template so field order is fixed
// by construction and every price-relevant field is visibly included. Route
// fields are lowercased so "Lagos" and "lagos" price identically.
const searchKey = (search: RateSearch): string => {
  const route = [
    search.origin.toLowerCase(),
    search.destination.toLowerCase(),
    search.shipDate,
  ].join("|");

  const cargo =
    search.cargo.mode === "containers"
      ? `containers|${search.cargo.size}|${search.cargo.quantity}`
      : `loose|${search.cargo.pieces}|${search.cargo.totalWeightKg}`;

  return `${route}|${cargo}`;
};

const randomIntBetween = (
  rng: () => number,
  min: number,
  max: number,
): number => min + Math.floor(rng() * (max - min + 1));

// Rough effort proxy for pricing: containers by count and size, loose cargo by
// piece count and weight, floored so tiny shipments still price sanely.
const cargoScale = (cargo: RateSearch["cargo"]): number =>
  Math.max(
    0.25,
    cargo.mode === "containers"
      ? cargo.quantity * (cargo.size === "40ft" ? 1.75 : 1)
      : cargo.pieces * 0.05 + cargo.totalWeightKg / 500,
  );

// Even the simulated network latency is derived from the search, so response
// timing is as reproducible as the quotes themselves (400–900 ms).
export const simulatedLatencyMs = (search: RateSearch): number =>
  400 + (fnv1a(searchKey(search)) % 501);

export const generateQuotes = (search: RateSearch): Quote[] => {
  const destination = search.destination.toLowerCase();
  if (destination === UPSTREAM_ERROR_TRIGGER) {
    throw new SimulatedUpstreamError();
  }
  if (destination === EMPTY_RESULTS_TRIGGER) {
    return [];
  }

  const seed = fnv1a(searchKey(search));
  const rng = mulberry32(seed);
  const scale = cargoScale(search.cargo);
  const quoteCount = randomIntBetween(rng, 3, 6);

  const availableCarriers = [...CARRIERS];
  const quotes: Quote[] = [];

  for (let index = 0; index < quoteCount; index++) {
    const carrier = availableCarriers.splice(
      Math.floor(rng() * availableCarriers.length),
      1,
    )[0];

    const baseFreight = Math.round((80_000 + rng() * 160_000) * scale);
    const fuelSurcharge = Math.round(baseFreight * (0.15 + rng() * 0.15));
    const handling = randomIntBetween(rng, 15_000, 45_000);

    const lineItems = [
      { label: "Base freight", amountCents: baseFreight },
      { label: "Fuel surcharge", amountCents: fuelSurcharge },
      { label: "Handling", amountCents: handling },
    ];

    // Fee is drawn before the coin flip so every quote consumes the same
    // number of rng() calls whether or not the fee applies.
    const documentationFee = randomIntBetween(rng, 8_000, 20_000);
    if (rng() < 0.5) {
      lineItems.push({
        label: "Documentation fee",
        amountCents: documentationFee,
      });
    }

    quotes.push({
      id: `q-${seed.toString(16)}-${index}`,
      carrier,
      transitDays: randomIntBetween(rng, 10, 42),
      lineItems,
      totalCents: lineItems.reduce((sum, item) => sum + item.amountCents, 0),
      currency: "USD",
    });
  }

  return quotes;
};
