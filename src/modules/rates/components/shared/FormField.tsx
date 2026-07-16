import type {
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

interface SelectOption {
  value: string;
  label: string;
}

interface FormFieldProps<TFieldValues extends FieldValues> {
  label: string;
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  type?: "text" | "date" | "number" | "select";
  placeholder?: string;
  options?: SelectOption[];
  error?: string;
  min?: string;
  max?: number;
  step?: number;
  className?: string;
}

export default function FormField<TFieldValues extends FieldValues>({
  label,
  name,
  register,
  type = "text",
  placeholder,
  options,
  error,
  min,
  max,
  step,
  className,
}: FormFieldProps<TFieldValues>) {
  const baseClassName =
    "w-full min-h-10 px-3 py-2 border rounded-sm border-secondary-light focus:border-2 focus:bg-secondary-light/10 focus:outline-none transition-all text-sm text-secondary placeholder:text-secondary-light box-border";

  const interactiveClassName =
    type === "select" || type === "date"
      ? " hover:cursor-pointer"
      : "";

  const fieldClassName = `${baseClassName}${interactiveClassName} ${className ?? ""}`.trim();

  return (
    <div className="space-y-2">
      <label className="block text-xs font-mono uppercase tracking-wider text-secondary mb-2">
        {label}
      </label>

      {type === "select" ? (
        <select {...register(name)} className={fieldClassName}>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          {...register(name)}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className={fieldClassName}
        />
      )}

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
