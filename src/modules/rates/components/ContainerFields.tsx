// ContainerFields — the containers-mode body of CargoModeCard: container size
// (20ft / 40ft — select or segmented control) and quantity (number input,
// min 1). Inline errors per field.
import { useFormContext, useFormState, type FieldErrors } from "react-hook-form";
import type { Cargo, RateSearchInput } from "../types";
import FormField from "./shared/FormField";

export default function ContainerFields() {
  const { register, control } = useFormContext<RateSearchInput>();
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
      <FormField<RateSearchInput>
        label="Container Size"
        name="cargo.size"
        register={register}
        type="select"
        options={[
          { value: "20ft", label: "20ft" },
          { value: "40ft", label: "40ft" },
        ]}
        error={cargoErrors?.size?.message?.toString()}
      />

      <FormField<RateSearchInput>
        label="Quantity"
        name="cargo.quantity"
        register={register}
        type="number"
        min="1"
        max={500}
        placeholder="Enter quantity"
        error={cargoErrors?.quantity?.message?.toString()}
      />
    </div>
  );
}
