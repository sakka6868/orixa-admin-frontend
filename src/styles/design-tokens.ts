/**
 * 设计令牌 (Design Tokens)
 * 用于统一管理设计系统的核心变量
 */

// ============================================
// 色彩系统
// ============================================
export const colors = {
  // 品牌色
  brand: {
    25: '#f2f7ff',
    50: '#ecf3ff',
    100: '#dde9ff',
    200: '#c2d6ff',
    300: '#9cb9ff',
    400: '#7592ff',
    500: '#465fff',
    600: '#3641f5',
    700: '#2a31d8',
    800: '#252dae',
    900: '#262e89',
    950: '#161950',
  },
  // 语义色 - 成功
  success: {
    25: '#f6fef9',
    50: '#ecfdf3',
    100: '#d1fadf',
    200: '#a6f4c5',
    300: '#6ce9a6',
    400: '#32d583',
    500: '#12b76a',
    600: '#039855',
    700: '#027a48',
    800: '#05603a',
    900: '#054f31',
    950: '#053321',
  },
  // 语义色 - 错误
  error: {
    25: '#fffbfa',
    50: '#fef3f2',
    100: '#fee4e2',
    200: '#fecdca',
    300: '#fda29b',
    400: '#f97066',
    500: '#f04438',
    600: '#d92d20',
    700: '#b42318',
    800: '#912018',
    900: '#7a271a',
    950: '#55160c',
  },
  // 语义色 - 警告
  warning: {
    25: '#fffcf5',
    50: '#fffaeb',
    100: '#fef0c7',
    200: '#fedf89',
    300: '#fec84b',
    400: '#fdb022',
    500: '#f79009',
    600: '#dc6803',
    700: '#b54708',
    800: '#93370d',
    900: '#7a2e0e',
    950: '#4e1d09',
  },
  // 中性色
  gray: {
    25: '#fcfcfd',
    50: '#f9fafb',
    100: '#f2f4f7',
    200: '#e4e7ec',
    300: '#d0d5dd',
    400: '#98a2b3',
    500: '#667085',
    600: '#475467',
    700: '#344054',
    800: '#1d2939',
    900: '#101828',
    950: '#0c111d',
  },
  // 辅助色
  blue: {
    50: '#f0f9ff',
    500: '#0ba5ec',
    600: '#0086c9',
  },
  orange: {
    50: '#fff6ed',
    500: '#fb6514',
    600: '#ec4a0a',
  },
  purple: {
    500: '#7a5af8',
  },
  pink: {
    500: '#ee46bc',
  },
} as const;

// ============================================
// 字体系统
// ============================================
export const typography = {
  // 字体族
  fontFamily: {
    primary: 'Outfit, system-ui, -apple-system, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  // 字体大小
  fontSize: {
    '2xs': ['10px', { lineHeight: '14px' }],
    xs: ['12px', { lineHeight: '18px' }],
    sm: ['14px', { lineHeight: '20px' }],
    base: ['16px', { lineHeight: '24px' }],
    lg: ['18px', { lineHeight: '28px' }],
    xl: ['20px', { lineHeight: '30px' }],
    '2xl': ['24px', { lineHeight: '32px' }],
    '3xl': ['30px', { lineHeight: '38px' }],
    '4xl': ['36px', { lineHeight: '44px' }],
    '5xl': ['48px', { lineHeight: '60px' }],
    '6xl': ['60px', { lineHeight: '72px' }],
    '7xl': ['72px', { lineHeight: '90px' }],
  },
  // 字重
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  // 行高
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  // 字间距
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============================================
// 间距系统 (基于 8px 网格)
// ============================================
export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  11: '44px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
} as const;

// ============================================
// 圆角系统
// ============================================
export const borderRadius = {
  none: '0px',
  sm: '2px',
  DEFAULT: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const;

// ============================================
// 阴影系统
// ============================================
export const shadows = {
  xs: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
  sm: '0px 1px 3px 0px rgba(16, 24, 40, 0.1), 0px 1px 2px 0px rgba(16, 24, 40, 0.06)',
  md: '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
  lg: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
  xl: '0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)',
  '2xl': '0px 24px 48px -12px rgba(16, 24, 40, 0.25)',
  '3xl': '0px 32px 64px -12px rgba(16, 24, 40, 0.3)',
  inner: 'inset 0px 2px 4px 0px rgba(16, 24, 40, 0.05)',
  focus: '0px 0px 0px 4px rgba(70, 95, 255, 0.12)',
  'focus-error': '0px 0px 0px 4px rgba(240, 68, 56, 0.12)',
  'focus-success': '0px 0px 0px 4px rgba(18, 183, 106, 0.12)',
} as const;

// ============================================
// 过渡动画
// ============================================
export const transitions = {
  // 持续时间
  duration: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
  },
  // 缓动函数
  easing: {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    // 自定义贝塞尔曲线
    'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  // 常用组合
  default: 'all 200ms ease-in-out',
  fast: 'all 100ms ease-out',
  slow: 'all 300ms ease-in-out',
  transform: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  opacity: 'opacity 200ms ease-in-out',
  colors: 'background-color 200ms ease-in-out, border-color 200ms ease-in-out, color 200ms ease-in-out',
} as const;

// ============================================
// Z-Index 层级
// ============================================
export const zIndex = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 100,
  sticky: 200,
  banner: 300,
  overlay: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  spinner: 900,
} as const;

// ============================================
// 断点系统
// ============================================
export const breakpoints = {
  '2xsm': '375px',
  xsm: '425px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '2000px',
} as const;

// ============================================
// 组件特定令牌
// ============================================
export const componentTokens = {
  // 按钮
  button: {
    height: {
      sm: '36px',
      md: '44px',
      lg: '52px',
    },
    padding: {
      sm: '0 12px',
      md: '0 16px',
      lg: '0 24px',
    },
    fontSize: {
      sm: '14px',
      md: '14px',
      lg: '16px',
    },
    borderRadius: '8px',
  },
  // 输入框
  input: {
    height: '44px',
    padding: '0 14px',
    borderRadius: '8px',
    fontSize: '14px',
  },
  // 卡片
  card: {
    borderRadius: '16px',
    padding: '24px',
    shadow: shadows.md,
  },
  // 模态框
  modal: {
    borderRadius: '16px',
    padding: '40px',
    border: {
      width: '1px',
      color: {
        light: '#e4e7ec', // gray-200
        dark: '#344054', // gray-700
      },
    },
    shadow: shadows.lg,
    maxWidth: {
      sm: '400px',
      md: '560px',
      lg: '720px',
      xl: '960px',
      full: '95vw',
    },
  },
  // 表格
  table: {
    headerHeight: '48px',
    rowHeight: '64px',
    cellPadding: '16px 24px',
  },
} as const;

// ============================================
// 可访问性配置
// ============================================
export const accessibility = {
  // 焦点环
  focusRing: {
    width: '2px',
    offset: '2px',
    color: colors.brand[500],
  },
  // 最小点击区域
  minTouchTarget: '44px',
  // 颜色对比度要求
  contrast: {
    normal: 4.5,
    large: 3,
  },
  // 动画偏好
  reducedMotion: {
    mediaQuery: '(prefers-reduced-motion: reduce)',
  },
} as const;

// 导出完整设计令牌对象
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  componentTokens,
  accessibility,
} as const;

export default designTokens;
