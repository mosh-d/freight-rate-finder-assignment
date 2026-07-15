// CargoModeCard — the radio-card pattern from the reference designs: two radio
// options in the card header (Containers ◉ / Loose cargo ○); the card body
// swaps between ContainerFields and LooseCargoFields based on the selected
// mode. Plan notes (commit 10): switching mode should reset the other mode's
// field values so stale values can't linger; radios are real <input
// type="radio"> for keyboard/a11y, styled as cards.
import { useFormContext, useWatch } from "react-hook-form";
import type { RateSearchInput } from "../types";
import ContainerFields from "./ContainerFields";
import LooseCargoFields from "./LooseCargoFields";

export default function CargoModeCard() {
  // The mode lives in the form, not in local state — otherwise the rendered
  // fields and the submitted cargo.mode can disagree (silent wrong searches).
  // useWatch (not watch()): it subscribes THIS component, which the React
  // Compiler's memoization respects; plain watch() left the card frozen.
  const { register, control } = useFormContext<RateSearchInput>();
  const mode = useWatch({ control, name: "cargo.mode" });

  return (
    <div className="w-full bg-secondary-light/10 rounded-lg border border-secondary-light shadow-sm">
      {/* Radio Card Header */}
      <div className="flex w-full justify-between p-4">
        <label className="cursor-pointer">
          <input
            type="radio"
            value="containers"
            {...register("cargo.mode")}
            className="sr-only"
          />
          <div
            className={`flex items-center gap-2 transition-all ${
              mode === "containers"
                ? "text-secondary"
                : "text-secondary"
            }`}
          >
            <div
              className={`size-3 rounded-full border-2 flex items-center justify-center ${
                mode === "containers"
                  ? "border-secondary-light bg-secondary-light"
                  : "border-secondary-light bg-transparent"
              }`}
            >
              {mode === "containers" && (
                <div className="size-3 rounded-full bg-secondary-light" />
              )}
            </div>
            <span className="font-bold text-sm text-secondary">Containers</span>
          </div>
        </label>

        <label className="cursor-pointer">
          <input
            type="radio"
            value="loose"
            {...register("cargo.mode")}
            className="sr-only"
          />
          <div
            className={`flex items-center gap-2 transition-all ${
              mode === "loose"
                ? "text-secondary"
                : "text-secondary"
            }`}
          >
            <div
              className={`size-3 rounded-full border-2 flex items-center justify-center ${
                mode === "loose"
                  ? "border-secondary-light bg-secondary-light"
                  : "border-secondary-light bg-transparent"
              }`}
            >
              {mode === "loose" && (
                <div className="size-3 rounded-full bg-secondary-light" />
              )}
            </div>
            <span className="font-bold text-sm text-secondary">Loose cargo</span>
          </div>
        </label>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {mode === "containers" ? <ContainerFields /> : <LooseCargoFields />}
      </div>
    </div>
  );
}
