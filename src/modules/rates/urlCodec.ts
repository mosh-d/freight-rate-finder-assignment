import { rateSearchSchema } from "./schemas";
import type { RateSearch } from "./types";

// The URL is the persistence layer: a submitted search is encoded as flat,
// human-readable params and decoded back through the same schema the form and
// server use. Lives at the module root because both the page (client) and any
// future server-side reader share it — it is neither a hook nor server logic.
//
//   ?origin=Lagos&destination=Rotterdam&shipDate=2027-03-15&mode=containers&size=40ft&quantity=2
//   ?origin=Lagos&destination=Rotterdam&shipDate=2027-03-15&mode=loose&pieces=10&weightKg=340.5

export const searchToParams = (search: RateSearch): URLSearchParams => {
  const params = new URLSearchParams({
    origin: search.origin,
    destination: search.destination,
    shipDate: search.shipDate,
    mode: search.cargo.mode,
  });

  if (search.cargo.mode === "containers") {
    params.set("size", search.cargo.size);
    params.set("quantity", String(search.cargo.quantity));
  } else {
    params.set("pieces", String(search.cargo.pieces));
    params.set("weightKg", String(search.cargo.totalWeightKg));
  }

  return params;
};

// Anything that doesn't survive full schema validation — missing fields, an
// unknown mode, a past date, a hand-edited quantity of 0 — yields null, and
// the page treats null as "no search yet". No partial hydration.
export const paramsToSearch = (params: URLSearchParams): RateSearch | null => {
  const mode = params.get("mode");

  const cargo =
    mode === "containers"
      ? {
          mode,
          size: params.get("size"),
          quantity: params.get("quantity"),
        }
      : mode === "loose"
        ? {
            mode,
            pieces: params.get("pieces"),
            totalWeightKg: params.get("weightKg"),
          }
        : null;

  const parsed = rateSearchSchema.safeParse({
    origin: params.get("origin"),
    destination: params.get("destination"),
    shipDate: params.get("shipDate"),
    cargo,
  });

  return parsed.success ? parsed.data : null;
};
