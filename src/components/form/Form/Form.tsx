/**
 * 表单组件
 * 提供统一的表单布局和验证集成
 */

import React, { FormHTMLAttributes, ReactNode } from "react";
import { cn } from "../../../utils";
import Button from "../../ui/button/Button";

// ============================================
// Form 组件
// ============================================

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  layout?: "vertical" | "horizontal" | "inline";
  className?: string;
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  (
    { children, onSubmit, loading, disabled, layout = "vertical", className, ...props },
    ref
  ) => {
    return (
      <form
        ref={ref}
        onSubmit={onSubmit}
        className={cn(
          "space-y-6",
          layout === "horizontal" && "md:grid md:grid-cols-2 md:gap-6 md:space-y-0",
          layout === "inline" && "flex flex-wrap items-end gap-4",
          className
        )}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = "Form";

// ============================================
// FormSection 组件 - 表单分组
// ============================================

export interface FormSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  children,
  title,
  description,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

// ============================================
// FormField 组件 - 表单字段包装器
// ============================================

export interface FormFieldProps {
  children: ReactNode;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  htmlFor?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  required,
  error,
  helperText,
  className,
  htmlFor,
}) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="ml-1 text-error-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-xs text-error-500" role="alert">
          <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      ) : null}
    </div>
  );
};

// ============================================
// FormActions 组件 - 表单操作按钮
// ============================================

export interface FormActionsProps {
  children?: ReactNode;
  onCancel?: () => void;
  cancelText?: string;
  submitText?: string;
  loading?: boolean;
  loadingText?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

const FormActions: React.FC<FormActionsProps> = ({
  children,
  onCancel,
  cancelText = "取消",
  submitText = "提交",
  loading = false,
  loadingText = "提交中...",
  align = "right",
  className,
}) => {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  if (children) {
    return (
      <div className={cn("flex items-center gap-3 pt-4", alignClasses[align], className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 pt-4", alignClasses[align], className)}>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
      )}
      <Button type="submit" isLoading={loading} loadingText={loadingText}>
        {submitText}
      </Button>
    </div>
  );
};

// ============================================
// FormGrid 组件 - 表单网格布局
// ============================================

export interface FormGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

const FormGrid: React.FC<FormGridProps> = ({
  children,
  cols = 2,
  gap = "md",
  className,
}) => {
  const colsClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  return (
    <div className={cn("grid", colsClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
};

// ============================================
// 导出
// ============================================

export { Form, FormSection, FormField, FormActions, FormGrid };
export default Form;
