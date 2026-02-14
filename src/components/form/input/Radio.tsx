import React from "react";
import { cn } from "../../../utils";

export interface RadioProps {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  label: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const Radio: React.FC<RadioProps> = ({
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
        "relative flex cursor-pointer select-none items-start gap-3 text-sm",
        disabled
          ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
          : "text-gray-700 dark:text-gray-300",
        className
      )}
    >
      <input
        id={id}
        name={name}
        type="radio"
        value={value}
        checked={checked}
        onChange={() => !disabled && onChange(value)}
        className="sr-only"
        disabled={disabled}
        aria-checked={checked}
      />
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-200",
          checked
            ? "border-brand-500 bg-brand-500"
            : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800",
          disabled && "border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full bg-white transition-transform duration-200",
            checked ? "scale-100" : "scale-0"
          )}
        />
      </span>
      <span className="leading-6">{label}</span>
    </label>
  );
};

export default Radio;
