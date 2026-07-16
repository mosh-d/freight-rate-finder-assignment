// LooseCargoFields — the loose-mode body of CargoModeCard: number of pieces
// (int, min 1) and total weight in kg (positive, decimals allowed). Inline
// errors per field.
import { useFormContext, useFormState, type FieldErrors } from "react-hook-form";
import type { Cargo, RateSearchInput } from "../types";
import FormField from "./shared/FormField";

export default function LooseCargoFields() {
  const { register, control } = useFormContext<RateSearchInput>();
  // useFormState subscribes this component to error changes; reading errors
  // off the context froze under React Compiler memoization.
  const { errors } = useFormState({ control });

  // RHF's generic FieldErrors can't see through the cargo discriminated
  // union; narrow the nested errors to this mode's branch once.
  const cargoErrors = errors.cargo as
    | FieldErrors<Extract<Cargo, { mode: "loose" }>>
    | undefined;

  return (
    <div className="space-y-4 border-1 border-secondary-light rounded-lg p-4 bg-secondary-light/10">
      <FormField<RateSearchInput>
        label="Number of Pieces"
        name="cargo.pieces"
        register={register}
        type="number"
        min="1"
        max={10_000}
        placeholder="Enter number of pieces"
        error={cargoErrors?.pieces?.message?.toString()}
      />

      <FormField<RateSearchInput>
        label="Total Weight (kg)"
        name="cargo.totalWeightKg"
        register={register}
        type="number"
        min="0"
        step={0.01}
        max={100_000}
        placeholder="Enter total weight"
        error={cargoErrors?.totalWeightKg?.message?.toString()}
      />
    </div>
  );
}
