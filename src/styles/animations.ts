/**
 * 动画与过渡工具
 * 提供统一的动画配置和 CSS 动画关键帧
 */

import { transitions } from './design-tokens';

// ============================================
// CSS 关键帧动画
// ============================================
export const keyframes = `
/* 淡入 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 淡出 */
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* 从下方滑入 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 从上方滑入 */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 从左侧滑入 */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 从右侧滑入 */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 缩放进入 */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 缩放退出 */
@keyframes scaleOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* 弹跳进入 */
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 脉冲 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 旋转 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 摇晃 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

/* 加载条 */
@keyframes loading-bar {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0); }
  100% { transform: translateX(100%); }
}

/* 骨架屏闪烁 */
@keyframes skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 模态框背景淡入 */
@keyframes modal-backdrop-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 模态框内容进入 */
@keyframes modal-content-in {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Toast 滑入 */
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Toast 滑出 */
@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

/* 下拉菜单进入 */
@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 工具提示进入 */
@keyframes tooltip-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// ============================================
// 动画预设配置
// ============================================
export const animationPresets = {
  // 淡入淡出
  fade: {
    in: {
      animation: `fadeIn ${transitions.duration.normal} ${transitions.easing.ease}`,
    },
    out: {
      animation: `fadeOut ${transitions.duration.normal} ${transitions.easing.ease}`,
    },
  },
  // 滑入
  slideUp: {
    in: {
      animation: `slideInUp ${transitions.duration.slow} ${transitions.easing['ease-out']}`,
    },
  },
  slideDown: {
    in: {
      animation: `slideInDown ${transitions.duration.slow} ${transitions.easing['ease-out']}`,
    },
  },
  slideLeft: {
    in: {
      animation: `slideInLeft ${transitions.duration.slow} ${transitions.easing['ease-out']}`,
    },
  },
  slideRight: {
    in: {
      animation: `slideInRight ${transitions.duration.slow} ${transitions.easing['ease-out']}`,
    },
  },
  // 缩放
  scale: {
    in: {
      animation: `scaleIn ${transitions.duration.normal} ${transitions.easing.spring}`,
    },
    out: {
      animation: `scaleOut ${transitions.duration.normal} ${transitions.easing['ease-in']}`,
    },
  },
  // 弹跳
  bounce: {
    in: {
      animation: `bounceIn ${transitions.duration.slow} ${transitions.easing.spring}`,
    },
  },
  // 模态框
  modal: {
    backdrop: {
      in: {
        animation: `modal-backdrop-in ${transitions.duration.normal} ${transitions.easing.ease}`,
      },
    },
    content: {
      in: {
        animation: `modal-content-in ${transitions.duration.slow} ${transitions.easing.spring}`,
      },
    },
  },
  // Toast
  toast: {
    in: {
      animation: `toast-in ${transitions.duration.normal} ${transitions.easing.spring}`,
    },
    out: {
      animation: `toast-out ${transitions.duration.normal} ${transitions.easing['ease-in']}`,
    },
  },
  // 下拉菜单
  dropdown: {
    in: {
      animation: `dropdown-in ${transitions.duration.fast} ${transitions.easing.spring}`,
    },
  },
  // 工具提示
  tooltip: {
    in: {
      animation: `tooltip-in ${transitions.duration.fast} ${transitions.easing['ease-out']}`,
    },
  },
  // 加载
  loading: {
    pulse: {
      animation: `pulse ${transitions.duration.slow} ${transitions.easing.ease} infinite`,
    },
    spin: {
      animation: `spin 1s linear infinite`,
    },
    skeleton: {
      animation: `skeleton-shimmer 1.5s ease-in-out infinite`,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
    },
  },
  // 错误
  error: {
    shake: {
      animation: `shake ${transitions.duration.normal} ${transitions.easing.ease}`,
    },
  },
} as const;

// ============================================
// 过渡类名生成器
// ============================================
export const transitionClasses = {
  // 基础过渡
  base: `transition-all ${transitions.duration.normal} ${transitions.easing['ease-in-out']}`,
  fast: `transition-all ${transitions.duration.fast} ${transitions.easing['ease-out']}`,
  slow: `transition-all ${transitions.duration.slow} ${transitions.easing['ease-in-out']}`,
  // 特定属性过渡
  colors: `transition-colors ${transitions.duration.fast} ${transitions.easing['ease-in-out']}`,
  transform: `transition-transform ${transitions.duration.normal} ${transitions.easing.spring}`,
  opacity: `transition-opacity ${transitions.duration.normal} ${transitions.easing['ease-in-out']}`,
  shadow: `transition-shadow ${transitions.duration.normal} ${transitions.easing['ease-in-out']}`,
};

// ============================================
// 可访问性：减少动画偏好
// ============================================
export const reducedMotion = {
  // 检测用户是否偏好减少动画
  mediaQuery: '(prefers-reduced-motion: reduce)',
  // 减少动画时的替代样式
  styles: `
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `,
};

export default {
  keyframes,
  animationPresets,
  transitionClasses,
  reducedMotion,
};
