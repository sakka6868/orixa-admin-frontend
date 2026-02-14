/**
 * 性能优化工具库
 * 提供组件懒加载、渲染优化、缓存等工具
 */

import React, {
  lazy,
  Suspense,
  ComponentType,
  ReactNode,
  memo,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
} from "react";
import { cn } from "./index";

// ============================================
// 组件懒加载
// ============================================

/**
 * 带加载状态的懒加载组件包装器
 */
interface LazyComponentOptions {
  fallback?: ReactNode;
  delay?: number; // 延迟显示加载状态的时间（ms），避免闪烁
}

export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): React.FC<React.ComponentProps<T>> {
  const { fallback, delay = 200 } = options;
  const LazyComponent = lazy(factory);

  const LazyWrapper: React.FC<React.ComponentProps<T>> = (props) => {
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setShowFallback(true);
      }, delay);
      return () => clearTimeout(timer);
    }, []);

    return React.createElement(
      Suspense,
      {
        fallback: showFallback
          ? fallback || React.createElement(
              'div',
              { className: 'flex h-32 items-center justify-center' },
              React.createElement('div', {
                className: 'h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent'
              })
            )
          : null
      },
      React.createElement(LazyComponent, props)
    );
  };

  return LazyWrapper;
}

// ============================================
// 渲染优化 Hooks
// ============================================

/**
 * 防抖 Hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 节流 Hook
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(timer);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * 防抖回调 Hook
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * 节流回调 Hook
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const lastRan = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const now = Date.now();
      const remaining = limit - (now - lastRan.current);

      if (remaining <= 0) {
        lastRan.current = now;
        callback(...args);
      } else {
        timeoutRef.current = setTimeout(() => {
          lastRan.current = Date.now();
          callback(...args);
        }, remaining);
      }
    },
    [callback, limit]
  );
}

// ============================================
// 缓存工具
// ============================================

/**
 * 简单的内存缓存
 */
class MemoryCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();

  set(key: string, value: T, ttlMs: number = 5 * 60 * 1000): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { value, expiry });
  }

  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
}

export const memoryCache = new MemoryCache<any>();

/**
 * 使用缓存的 Hook
 */
export function useCachedValue<T>(
  key: string,
  factory: () => T,
  deps: React.DependencyList,
  ttlMs: number = 5 * 60 * 1000
): T {
  return useMemo(() => {
    const cached = memoryCache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = factory();
    memoryCache.set(key, value, ttlMs);
    return value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ============================================
// 虚拟列表工具（简化版）
// ============================================

export interface VirtualListOptions {
  itemHeight: number;
  overscan?: number;
  containerHeight: number;
}

export interface VirtualListResult<T> {
  virtualItems: Array<{ item: T; index: number; style: React.CSSProperties }>;
  totalHeight: number;
  startIndex: number;
  endIndex: number;
}

export function useVirtualList<T>(
  items: T[],
  options: VirtualListOptions
): VirtualListResult<T> {
  const { itemHeight, overscan = 3, containerHeight } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);

  const virtualItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: "absolute" as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }));
  }, [items, startIndex, endIndex, itemHeight]);

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
  };
}

// ============================================
// 图片懒加载
// ============================================

export function useLazyImage(
  src: string,
  placeholderSrc?: string
): { src: string; isLoaded: boolean } {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || "");

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
  }, [src, placeholderSrc]);

  return { src: currentSrc, isLoaded };
}

// ============================================
// 性能监控
// ============================================

export function measurePerformance<T>(
  fn: () => T,
  label: string
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
  return result;
}

export function useRenderCount(componentName: string): number {
  const renderCount = useRef(0);
  renderCount.current++;

  useEffect(() => {
    console.log(`[Render] ${componentName} rendered ${renderCount.current} times`);
  });

  return renderCount.current;
}

// ============================================
// React.memo 优化包装器
// ============================================

/**
 * 深度比较 props 的 memo 包装器
 */
export function deepMemo<T extends ComponentType<any>>(
  Component: T,
  propsAreEqual?: (prevProps: React.ComponentProps<T>, nextProps: React.ComponentProps<T>) => boolean
): T {
  const defaultPropsAreEqual = (
    prevProps: React.ComponentProps<T>,
    nextProps: React.ComponentProps<T>
  ): boolean => {
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);

    if (prevKeys.length !== nextKeys.length) return false;

    for (const key of prevKeys) {
      if (prevProps[key as keyof typeof prevProps] !== nextProps[key as keyof typeof nextProps]) {
        return false;
      }
    }

    return true;
  };

  return memo(Component, propsAreEqual || defaultPropsAreEqual) as T;
}

// ============================================
// 导出
// ============================================

export {
  memo,
  useMemo,
  useCallback,
};

export default {
  lazyLoad,
  useDebounce,
  useThrottle,
  useDebouncedCallback,
  useThrottledCallback,
  memoryCache,
  useCachedValue,
  useVirtualList,
  useLazyImage,
  measurePerformance,
  useRenderCount,
  deepMemo,
};
