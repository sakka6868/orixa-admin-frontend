/**
 * 可访问性工具库
 * 提供 ARIA 属性、焦点管理、键盘导航等辅助功能
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ============================================
// ARIA 属性生成器
// ============================================

/**
 * 生成按钮的 ARIA 属性
 */
export const buttonAriaProps = ({
  label,
  expanded,
  pressed,
  hasPopup,
  disabled,
}: {
  label: string;
  expanded?: boolean;
  pressed?: boolean;
  hasPopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  disabled?: boolean;
}) => ({
  'aria-label': label,
  'aria-expanded': expanded,
  'aria-pressed': pressed,
  'aria-haspopup': hasPopup,
  'aria-disabled': disabled,
  role: 'button',
});

/**
 * 生成模态框的 ARIA 属性
 */
export const modalAriaProps = ({
  titleId,
  describedById,
  isOpen,
}: {
  titleId: string;
  describedById?: string;
  isOpen: boolean;
}) => ({
  role: 'dialog',
  'aria-modal': true,
  'aria-labelledby': titleId,
  'aria-describedby': describedById,
  'aria-hidden': !isOpen,
});

/**
 * 生成表单输入的 ARIA 属性
 */
export const inputAriaProps = ({
  id,
  labelId,
  error,
  errorMessage,
  required,
  describedBy,
}: {
  id: string;
  labelId?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  describedBy?: string;
}) => {
  const describedByIds = [
    describedBy,
    error && errorMessage ? `${id}-error` : undefined,
  ].filter(Boolean).join(' ') || undefined;

  return {
    id,
    'aria-labelledby': labelId,
    'aria-describedby': describedByIds,
    'aria-invalid': error,
    'aria-required': required,
    'aria-errormessage': error && errorMessage ? `${id}-error` : undefined,
  };
};

/**
 * 生成表格的 ARIA 属性
 */
export const tableAriaProps = ({
  caption,
  rowCount,
  colCount,
}: {
  caption?: string;
  rowCount?: number;
  colCount?: number;
}) => ({
  role: 'table',
  'aria-label': caption,
  'aria-rowcount': rowCount,
  'aria-colcount': colCount,
});

/**
 * 生成导航的 ARIA 属性
 */
export const navigationAriaProps = ({
  label,
  current,
}: {
  label: string;
  current?: string;
}) => ({
  role: 'navigation',
  'aria-label': label,
  'aria-current': current,
});

// ============================================
// 焦点管理 Hooks
// ============================================

/**
 * 焦点陷阱 Hook - 用于模态框等需要限制焦点的组件
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      // 保存当前焦点
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // 聚焦到容器内的第一个可聚焦元素
      const container = containerRef.current;
      if (container) {
        const focusableElements = container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        firstElement?.focus();
      }
    }

    return () => {
      // 恢复之前的焦点
      if (!isActive && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isActive]);

  // 处理 Tab 键循环
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }, []);

  return { containerRef, handleKeyDown };
};

/**
 * 自动聚焦 Hook
 */
export const useAutoFocus = <T extends HTMLElement>(shouldFocus: boolean) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (shouldFocus && ref.current) {
      ref.current.focus();
    }
  }, [shouldFocus]);

  return ref;
};

/**
 * 焦点可见性检测 Hook
 */
export const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setIsFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isFocusVisible;
};

// ============================================
// 键盘导航工具
// ============================================

/**
 * 键盘快捷键配置
 */
export const keyboardShortcuts = {
  // 导航
  escape: 'Escape',
  enter: 'Enter',
  space: ' ',
  tab: 'Tab',
  // 方向键
  arrowUp: 'ArrowUp',
  arrowDown: 'ArrowDown',
  arrowLeft: 'ArrowLeft',
  arrowRight: 'ArrowRight',
  // 功能键
  home: 'Home',
  end: 'End',
  pageUp: 'PageUp',
  pageDown: 'PageDown',
};

/**
 * 处理列表键盘导航
 */
export const handleListKeyboardNavigation = (
  e: React.KeyboardEvent,
  itemCount: number,
  currentIndex: number,
  onSelect: (index: number) => void
) => {
  switch (e.key) {
    case keyboardShortcuts.arrowDown:
      e.preventDefault();
      onSelect((currentIndex + 1) % itemCount);
      break;
    case keyboardShortcuts.arrowUp:
      e.preventDefault();
      onSelect((currentIndex - 1 + itemCount) % itemCount);
      break;
    case keyboardShortcuts.home:
      e.preventDefault();
      onSelect(0);
      break;
    case keyboardShortcuts.end:
      e.preventDefault();
      onSelect(itemCount - 1);
      break;
  }
};

// ============================================
// 颜色对比度检查
// ============================================

/**
 * 计算颜色的相对亮度
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * 计算两个颜色之间的对比度
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  // 简化的十六进制颜色解析
  const parseColor = (color: string): [number, number, number] => {
    const hex = color.replace('#', '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  };

  const [r1, g1, b1] = parseColor(color1);
  const [r2, g2, b2] = parseColor(color2);

  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * 检查对比度是否符合 WCAG 标准
 */
export const checkContrast = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  const threshold = level === 'AAA' 
    ? (size === 'large' ? 4.5 : 7) 
    : (size === 'large' ? 3 : 4.5);
  return ratio >= threshold;
};

// ============================================
// 屏幕阅读器文本
// ============================================

/**
 * 仅对屏幕阅读器可见的文本样式
 */
export const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
} as const;

/**
 * 屏幕阅读器文本组件属性
 */
export const srOnlyProps = {
  className: 'sr-only',
};

// ============================================
// 导出所有工具
// ============================================
export default {
  buttonAriaProps,
  modalAriaProps,
  inputAriaProps,
  tableAriaProps,
  navigationAriaProps,
  useFocusTrap,
  useAutoFocus,
  useFocusVisible,
  keyboardShortcuts,
  handleListKeyboardNavigation,
  getContrastRatio,
  checkContrast,
  srOnlyStyles,
  srOnlyProps,
};


