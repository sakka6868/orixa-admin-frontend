import React from "react";
import { cn } from "../../../utils";

export interface RadioSmProps {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  label: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const RadioSm: React.FC<RadioSmProps> = ({
  id,
  name,
  value,
  checked,
  label,
  onChange,
  className = "",
  disabled = false,
}) => {
  return (
    <label
      htmlFor={id}
      className={cn(
        "relative flex cursor-pointer select-none items-start gap-2 text-sm",
        disabled
          ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
          : "text-gray-600 dark:text-gray-400",
        className
      )}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={() => !disabled && onChange(value)}
        className="sr-only"
        disabled={disabled}
        aria-checked={checked}
      />
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
          checked
            ? "border-brand-500 bg-brand-500"
            : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800",
          disabled && "border-gray-200 bg-gray-100 dark:border-gray-700"
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-all duration-200",
            checked ? "scale-100 bg-white" : "scale-0 bg-gray-400 dark:bg-gray-600"
          )}
        />
      </span>
      <span className="leading-5">{label}</span>
    </label>
  );
};

export default RadioSm;
