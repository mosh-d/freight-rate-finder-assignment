// ContainerFields — the containers-mode body of CargoModeCard: container size
// (20ft / 40ft — select or segmented control) and quantity (number input,
// min 1). Inline errors per field.
import { useFormContext, useFormState, type FieldErrors } from "react-hook-form";
import type { Cargo } from "../types";

export default function ContainerFields() {
  const { register, control } = useFormContext();
  // useFormState subscribes this component to error changes; reading errors
  // off the context froze under React Compiler memoization.
  const { errors } = useFormState({ control });

  // RHF's generic FieldErrors can't see through the cargo discriminated
  // union; narrow the nested errors to this mode's branch once.
  const cargoErrors = errors.cargo as
    | FieldErrors<Extract<Cargo, { mode: "containers" }>>
    | undefined;

  return (
    <div className="space-y-4 border-1 border-secondary-light rounded-lg p-4 bg-secondary-light/10">
      <div className="min-h-16">
        <label className="block text-xs font-mono uppercase tracking-wider text-secondary mb-2">
          Container Size
        </label>
        <select
          {...register("cargo.size")}
          className="w-full px-3 py-2 border-1 rounded-sm border-secondary-light focus:border-2 focus:bg-secondary-light/10 focus:outline-none hover:cursor-pointer transition-all text-sm"
        >
          <option value="20ft">20ft</option>
          <option value="40ft">40ft</option>
        </select>
        {cargoErrors?.size && (
          <p className="text-red-600 text-xs mt-1">
            {cargoErrors.size.message?.toString()}
          </p>
        )}
      </div>

      <div className="min-h-16">
        <label className="block text-xs font-mono uppercase tracking-wider text-secondary mb-2">
          Quantity
        </label>
        <input
          type="number"
          {...register("cargo.quantity")}
          min={1}
          max={500}
          className="w-full px-3 py-2 border-1 rounded-sm border-secondary-light focus:border-2 focus:outline-none focus:bg-secondary-light/10 transition-colors text-sm placeholder:text-secondary-light"
          placeholder="Enter quantity"
        />
        {cargoErrors?.quantity && (
          <p className="text-red-600 text-xs mt-1">
            {cargoErrors.quantity.message?.toString()}
          </p>
        )}
      </div>
    </div>
  );
}
