/**
 * 加载状态组件
 * 提供多种加载指示器样式
 */

import React from "react";
import { cn } from "../../../utils";

export interface LoadingProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "skeleton";
  color?: "primary" | "secondary" | "white";
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  className?: string;
}

// 尺寸映射
const sizeMap = {
  xs: { spinner: 16, dots: 4 },
  sm: { spinner: 20, dots: 6 },
  md: { spinner: 32, dots: 8 },
  lg: { spinner: 48, dots: 12 },
  xl: { spinner: 64, dots: 16 },
};

// 颜色映射
const colorMap = {
  primary: "text-brand-500",
  secondary: "text-gray-500",
  white: "text-white",
};

/**
 * 旋转加载器
 */
const Spinner: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg
    className={cn("animate-spin", color)}
    style={{ width: size, height: size }}
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
);

/**
 * 跳动点加载器
 */
const Dots: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <div className={cn("flex items-center gap-1", color)}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="animate-bounce rounded-full bg-current"
        style={{
          width: size,
          height: size,
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
  </div>
);

/**
 * 脉冲加载器
 */
const Pulse: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <div className={cn("relative flex items-center justify-center", color)}>
    <div
      className="absolute rounded-full bg-current opacity-75 animate-ping"
      style={{ width: size, height: size }}
    />
    <div
      className="relative rounded-full bg-current"
      style={{ width: size * 0.5, height: size * 0.5 }}
    />
  </div>
);

/**
 * 骨架屏
 */
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      "animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700",
      className
    )}
  />
);

/**
 * 主加载组件
 */
const Loading: React.FC<LoadingProps> = ({
  size = "md",
  variant = "spinner",
  color = "primary",
  text,
  fullScreen = false,
  overlay = false,
  className,
}) => {
  const sizeValue = sizeMap[size];
  const colorValue = colorMap[color];

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {variant === "spinner" && (
        <Spinner size={sizeValue.spinner} color={colorValue} />
      )}
      {variant === "dots" && <Dots size={sizeValue.dots} color={colorValue} />}
      {variant === "pulse" && (
        <Pulse size={sizeValue.spinner} color={colorValue} />
      )}
      {text && (
        <span className={cn("text-sm font-medium", colorValue)}>{text}</span>
      )}
      <span className="sr-only">加载中...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/60 backdrop-blur-sm dark:bg-gray-900/60">
        {content}
      </div>
    );
  }

  return content;
};

// ============================================
// 专用加载组件
// ============================================

/**
 * 页面加载遮罩
 */
export const PageLoading: React.FC<{ text?: string }> = ({ text = "加载中..." }) => (
  <Loading fullScreen variant="spinner" size="lg" text={text} />
);

/**
 * 区域加载遮罩
 */
export const SectionLoading: React.FC<{ text?: string; className?: string }> = ({
  text,
  className,
}) => <Loading overlay variant="spinner" size="md" text={text} className={className} />;

/**
 * 按钮加载状态
 */
export const ButtonLoading: React.FC<{ size?: "sm" | "md" | "lg" }> = ({
  size = "md",
}) => {
  const sizeMap = { sm: "xs", md: "sm", lg: "md" };
  return <Loading variant="spinner" size={sizeMap[size] as LoadingProps["size"]} color="white" />;
};

/**
 * 表格行骨架屏
 */
export const TableRowSkeleton: React.FC<{ columns?: number; rows?: number }> = ({
  columns = 4,
  rows = 3,
}) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            className={cn(
              "h-12 flex-1",
              colIndex === 0 && "w-1/4",
              colIndex === columns - 1 && "w-24"
            )}
          />
        ))}
      </div>
    ))}
  </div>
);

/**
 * 卡片骨架屏
 */
export const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  </div>
);

/**
 * 表单骨架屏
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="space-y-6">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    ))}
    <Skeleton className="h-11 w-32 rounded-lg" />
  </div>
);

export { Skeleton };
export default Loading;
