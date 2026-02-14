import React, { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../../utils";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  successMessage?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      success = false,
      successMessage,
      startIcon,
      endIcon,
      size = "md",
      fullWidth = true,
      disabled = false,
      required = false,
      className,
      id,
      type = "text",
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    // 尺寸样式
    const sizeClasses = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-4 text-sm",
      lg: "h-12 px-4 text-base",
    };

    // 图标尺寸的内边距调整
    const iconPaddingClasses = {
      sm: {
        start: startIcon ? "pl-9" : "",
        end: endIcon ? "pr-9" : "",
      },
      md: {
        start: startIcon ? "pl-11" : "",
        end: endIcon ? "pr-11" : "",
      },
      lg: {
        start: startIcon ? "pl-12" : "",
        end: endIcon ? "pr-12" : "",
      },
    };

    // 状态样式
    const stateClasses = {
      default: "border-gray-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-500",
      error: "border-error-500 focus:border-error-500 focus:ring-4 focus:ring-error-500/10 dark:border-error-500",
      success: "border-success-500 focus:border-success-500 focus:ring-4 focus:ring-success-500/10 dark:border-success-500",
      disabled: "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    };

    const currentState = disabled ? "disabled" : hasError ? "error" : hasSuccess ? "success" : "default";

    return (
      <div className={cn(fullWidth && "w-full")}>
        {/* 标签 */}
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="ml-1 text-error-500">*</span>}
          </label>
        )}

        {/* 输入框容器 */}
        <div className="relative">
          {/* 起始图标 */}
          {startIcon && (
            <div className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none",
              size === "sm" && "left-2.5",
              size === "lg" && "left-4"
            )}>
              {startIcon}
            </div>
          )}

          {/* 输入框 */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError 
                ? `${inputId}-error` 
                : hasSuccess && successMessage 
                  ? `${inputId}-success` 
                  : helperText 
                    ? `${inputId}-helper` 
                    : undefined
            }
            className={cn(
              // 基础样式
              "w-full rounded-lg border bg-white text-gray-900 placeholder:text-gray-400",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none",
              "dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500",
              // 尺寸
              sizeClasses[size],
              // 图标内边距
              iconPaddingClasses[size].start,
              iconPaddingClasses[size].end,
              // 状态
              stateClasses[currentState],
              className
            )}
            {...props}
          />

          {/* 结束图标 */}
          {endIcon && (
            <div className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400",
              size === "sm" && "right-2.5",
              size === "lg" && "right-4"
            )}>
              {endIcon}
            </div>
          )}
        </div>

        {/* 错误提示 */}
        {hasError && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 flex items-center gap-1 text-xs text-error-500"
            role="alert"
          >
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}

        {/* 成功提示 */}
        {hasSuccess && successMessage && (
          <p
            id={`${inputId}-success`}
            className="mt-1.5 flex items-center gap-1 text-xs text-success-500"
          >
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </p>
        )}

        {/* 辅助文本 */}
        {helperText && !hasError && !(hasSuccess && successMessage) && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
