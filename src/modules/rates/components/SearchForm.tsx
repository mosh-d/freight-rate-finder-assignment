// SearchForm — react-hook-form + zodResolver(rateSearchSchema); defaultValues
// come from the URL (rehydration) or sensible blanks. Plan notes (commit 10):
//   - Submit = write the URL via useSearchParamsState; this component never fetches.
//   - Cargo mode picker renders CargoModeCard (radio header, swapping body).
//   - Inline errors under each field from formState.errors (nested: cargo.quantity …).
//   - Ship date: native <input type="date"> with min = tomorrow.
// Style: PLAN.md §UI style guide — ivory/gold, underline inputs, labels above,
// bold sans headings, mono uppercase eyebrow labels.
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { rateSearchSchema } from "../schemas";
import type { RateSearch, RateSearchInput } from "../types";
import CargoModeCard from "./CargoModeCard";
import FormField from "./shared/FormField";

interface SearchFormProps {
  defaultValues?: Partial<RateSearch>;
  onSubmit: (data: RateSearch) => void;
}

export default function SearchForm({ defaultValues, onSubmit }: SearchFormProps) {
  // Three generics because the schema coerces: the form holds the schema's
  // input type (strings from the DOM), submit hands over the parsed output.
  const methods = useForm<RateSearchInput, unknown, RateSearch>({
    resolver: zodResolver(rateSearchSchema),
    defaultValues: defaultValues || {
      origin: "",
      destination: "",
      shipDate: "",
      cargo: {
        mode: "containers",
        size: "20ft",
        quantity: 1,
      },
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  // Calculate tomorrow's date for min attribute
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split("T")[0];

  const onFormSubmit = (data: RateSearch) => {
    onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField<RateSearchInput>
            label="Origin"
            name="origin"
            register={register}
            type="text"
            placeholder="Enter origin city or port"
            error={errors.origin?.message?.toString()}
          />

          <FormField<RateSearchInput>
            label="Destination"
            name="destination"
            register={register}
            type="text"
            placeholder="Enter destination city or port"
            error={errors.destination?.message?.toString()}
          />

          <FormField<RateSearchInput>
            label="Ship Date"
            name="shipDate"
            register={register}
            type="date"
            min={tomorrowString}
            error={errors.shipDate?.message?.toString()}
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-secondary mb-2">
            Cargo Details
          </label>
          <CargoModeCard />
          {errors.cargo && (
            <p className="text-red-600 text-xs mt-1">
              {errors.cargo.message?.toString()}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-secondary-light text-white font-semibold rounded-md hover:bg-secondary/50 active:bg-secondary/70 hover:cursor-pointer transition-colors"
        >
          Search Rates
        </button>
      </form>
    </FormProvider>
  );
}
