import { describe, expect, it } from "vitest";

import type { RateSearch } from "./types";
import { paramsToSearch, searchToParams } from "./urlCodec";

const containerSearch: RateSearch = {
  origin: "Lagos",
  destination: "Rotterdam",
  shipDate: "2027-03-15",
  cargo: { mode: "containers", size: "40ft", quantity: 2 },
};

const looseSearch: RateSearch = {
  origin: "Port Harcourt",
  destination: "Hamburg",
  shipDate: "2027-03-15",
  cargo: { mode: "loose", pieces: 10, totalWeightKg: 340.5 },
};

describe("urlCodec", () => {
  it("round-trips a containers search", () => {
    expect(paramsToSearch(searchToParams(containerSearch))).toEqual(
      containerSearch,
    );
  });

  it("round-trips a loose cargo search, decimals and spaces included", () => {
    expect(paramsToSearch(searchToParams(looseSearch))).toEqual(looseSearch);
  });

  it("returns null for empty or structurally broken params", () => {
    for (const raw of [
      "",
      "origin=Lagos",
      "origin=Lagos&destination=Rotterdam&shipDate=2027-03-15",
      "origin=Lagos&destination=Rotterdam&shipDate=2027-03-15&mode=teleport",
    ]) {
      expect(paramsToSearch(new URLSearchParams(raw))).toBeNull();
    }
  });

  it("returns null when hand-edited values fail validation", () => {
    const pastDate = searchToParams(containerSearch);
    pastDate.set("shipDate", "2020-01-01");

    const zeroQuantity = searchToParams(containerSearch);
    zeroQuantity.set("quantity", "0");

    const crossModeFields = searchToParams(containerSearch);
    crossModeFields.set("mode", "loose");

    for (const params of [pastDate, zeroQuantity, crossModeFields]) {
      expect(paramsToSearch(params)).toBeNull();
    }
  });

  it("ignores extraneous params such as tracking noise", () => {
    const params = searchToParams(containerSearch);
    params.set("utm_source", "newsletter");

    expect(paramsToSearch(params)).toEqual(containerSearch);
  });
});
