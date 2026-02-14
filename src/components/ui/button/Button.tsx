import React, { ReactNode, ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../../utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      size = "md",
      variant = "primary",
      startIcon,
      endIcon,
      isLoading = false,
      loadingText,
      fullWidth = false,
      disabled,
      className,
      type = "button",
      ...props
    },
    ref
  ) => {
    // 尺寸样式
    const sizeClasses = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-5 text-sm",
      lg: "h-12 px-6 text-base",
    };

    // 变体样式
    const variantClasses = {
      primary:
        "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 active:bg-brand-700 disabled:bg-brand-300",
      secondary:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-4 focus:ring-gray-500/20 active:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
      outline:
        "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:ring-4 focus:ring-gray-500/20 active:bg-gray-100 disabled:bg-gray-50 disabled:text-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-200",
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-500/20 active:bg-gray-200 disabled:text-gray-400 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-200",
      danger:
        "bg-error-500 text-white shadow-theme-xs hover:bg-error-600 focus:ring-4 focus:ring-error-500/20 active:bg-error-700 disabled:bg-error-300",
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          // 基础样式
          "relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 ease-in-out",
          "focus:outline-none focus:ring-offset-2 dark:focus:ring-offset-gray-900",
          // 尺寸
          sizeClasses[size],
          // 变体
          variantClasses[variant],
          // 宽度
          fullWidth && "w-full",
          // 禁用状态
          isDisabled && "cursor-not-allowed opacity-60",
          // 加载状态
          isLoading && "text-transparent",
          className
        )}
        {...props}
      >
        {/* 加载动画 */}
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-5 w-5 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">{loadingText || "加载中..."}</span>
          </span>
        )}

        {/* 图标和内容 */}
        {startIcon && !isLoading && (
          <span className="flex items-center shrink-0">{startIcon}</span>
        )}
        <span className="truncate">{isLoading && loadingText ? loadingText : children}</span>
        {endIcon && !isLoading && (
          <span className="flex items-center shrink-0">{endIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
