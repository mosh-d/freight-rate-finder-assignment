// LooseCargoFields — the loose-mode body of CargoModeCard: number of pieces
// (int, min 1) and total weight in kg (positive, decimals allowed). Inline
// errors per field.
import { useFormContext, useFormState, type FieldErrors } from "react-hook-form";
import type { Cargo } from "../types";

export default function LooseCargoFields() {
  const { register, control } = useFormContext();
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
      <div className="h-[4rem]">
        <label className="block text-xs font-mono uppercase tracking-wider text-secondary mb-2">
          Number of Pieces
        </label>
        <input
          type="number"
          {...register("cargo.pieces")}
          min={1}
          max={10_000}
          className="w-full px-3 py-2 border-1 rounded-sm border-secondary-light focus:border-2 focus:bg-secondary-light/10 focus:outline-none hover:cursor-pointer transition-all text-sm placeholder:text-secondary-light"
          placeholder="Enter number of pieces"
        />
        {cargoErrors?.pieces && (
          <p className="text-red-600 text-xs mt-1">
            {cargoErrors.pieces.message?.toString()}
          </p>
        )}
      </div>

      <div className="h-[4rem]">
        <label className="block text-xs font-mono uppercase tracking-wider text-secondary mb-2">
          Total Weight (kg)
        </label>
        <input
          type="number"
          {...register("cargo.totalWeightKg")}
          min={0}
          step={0.01}
          max={100_000}
          className="w-full px-3 py-2 border-1 rounded-sm border-secondary-light focus:border-2 focus:bg-secondary-light/10 focus:outline-none hover:cursor-pointer transition-all text-sm placeholder:text-secondary-light"
          placeholder="Enter total weight"
        />
        {cargoErrors?.totalWeightKg && (
          <p className="text-red-600 text-xs mt-1">
            {cargoErrors.totalWeightKg.message?.toString()}
          </p>
        )}
      </div>
    </div>
  );
}
