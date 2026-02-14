import { forwardRef, HTMLAttributes } from "react";
import { cn } from "../../../utils";

// =============================================
// Spinner Component
// =============================================

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray";
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", color = "primary", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4 border-2",
      md: "h-6 w-6 border-2",
      lg: "h-8 w-8 border-3",
      xl: "h-12 w-12 border-4",
    };

    const colorClasses = {
      primary: "border-brand-500 border-t-transparent",
      white: "border-white border-t-transparent",
      gray: "border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full",
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

// =============================================
// Dots Loader Component
// =============================================

interface DotsLoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "gray";
}

export const DotsLoader = forwardRef<HTMLDivElement, DotsLoaderProps>(
  ({ className, size = "md", color = "primary", ...props }, ref) => {
    const sizeClasses = {
      sm: "gap-1",
      md: "gap-1.5",
      lg: "gap-2",
    };

    const dotSizeClasses = {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    };

    const colorClasses = {
      primary: "bg-brand-500",
      gray: "bg-gray-400",
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center", sizeClasses[size], className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <span
          className={cn(
            "rounded-full animate-bounce",
            dotSizeClasses[size],
            colorClasses[color]
          )}
          style={{ animationDelay: "0ms", animationDuration: "0.6s" }}
        />
        <span
          className={cn(
            "rounded-full animate-bounce",
            dotSizeClasses[size],
            colorClasses[color]
          )}
          style={{ animationDelay: "150ms", animationDuration: "0.6s" }}
        />
        <span
          className={cn(
            "rounded-full animate-bounce",
            dotSizeClasses[size],
            colorClasses[color]
          )}
          style={{ animationDelay: "300ms", animationDuration: "0.6s" }}
        />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

DotsLoader.displayName = "DotsLoader";

// =============================================
// Skeleton Component
// =============================================

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = "text",
      width,
      height,
      animate = true,
      style,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      text: "rounded",
      circular: "rounded-full",
      rectangular: "rounded-none",
      rounded: "rounded-lg",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "bg-gray-200 dark:bg-gray-700",
          variantClasses[variant],
          animate && "animate-pulse",
          className
        )}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
          ...style,
        }}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

// =============================================
// Skeleton Presets
// =============================================

export const SkeletonText = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Skeleton
      ref={ref}
      variant="text"
      className={cn("h-4 w-full", className)}
      {...props}
    />
  )
);
SkeletonText.displayName = "SkeletonText";

export const SkeletonAvatar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Skeleton
      ref={ref}
      variant="circular"
      className={cn("h-10 w-10", className)}
      {...props}
    />
  )
);
SkeletonAvatar.displayName = "SkeletonAvatar";

export const SkeletonButton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Skeleton
      ref={ref}
      variant="rounded"
      className={cn("h-10 w-24", className)}
      {...props}
    />
  )
);
SkeletonButton.displayName = "SkeletonButton";

export const SkeletonImage = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Skeleton
      ref={ref}
      variant="rounded"
      className={cn("h-40 w-full", className)}
      {...props}
    />
  )
);
SkeletonImage.displayName = "SkeletonImage";

// =============================================
// Loading Overlay Component
// =============================================

interface LoadingOverlayProps extends HTMLAttributes<HTMLDivElement> {
  loading: boolean;
  spinner?: boolean;
  text?: string;
  blur?: boolean;
}

export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    {
      className,
      loading,
      spinner = true,
      text,
      blur = true,
      children,
      ...props
    },
    ref
  ) => {
    if (!loading) return <>{children}</>;

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {children}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center",
            "bg-white/70 dark:bg-gray-900/70",
            blur && "backdrop-blur-sm",
            "z-10"
          )}
        >
          {spinner && <Spinner size="lg" />}
          {text && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }
);

LoadingOverlay.displayName = "LoadingOverlay";

// =============================================
// Exports
// =============================================

export default Spinner;
