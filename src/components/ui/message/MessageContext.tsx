import React, { createContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import Alert from "../alert/Alert";

// 消息类型
type MessageType = "success" | "error" | "warning" | "info";

// 消息配置接口
interface MessageConfig {
    type: MessageType;
    title: string;
    message: string;
    duration?: number; // 自动关闭时间（毫秒），默认 3000
    onClose?: () => void;
}

// Context 接口
export interface MessageContextType {
    showMessage: (config: MessageConfig) => void;
    success: (title: string, message: string, duration?: number) => void;
    error: (title: string, message: string, duration?: number) => void;
    warning: (title: string, message: string, duration?: number) => void;
    info: (title: string, message: string, duration?: number) => void;
}

// 创建 Context
const MessageContext = createContext<MessageContextType | null>(null);

// Provider 组件
interface MessageProviderProps {
    children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [config, setConfig] = useState<MessageConfig>({
        type: "info",
        title: "",
        message: "",
    });
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 清除定时器
    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // 关闭消息
    const closeMessage = useCallback(() => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsVisible(false);
            if (config.onClose) {
                config.onClose();
            }
        }, 300); // 动画时长
    }, [config]);

    // 显示消息
    const showMessage = useCallback((messageConfig: MessageConfig) => {
        clearTimer();
        setConfig(messageConfig);
        setIsVisible(true);
        
        // 延迟一帧触发动画
        requestAnimationFrame(() => {
            setIsAnimating(true);
        });

        // 设置自动关闭定时器
        const duration = messageConfig.duration ?? 3000;
        timerRef.current = setTimeout(() => {
            closeMessage();
        }, duration);
    }, [clearTimer, closeMessage]);

    // 组件卸载时清除定时器
    useEffect(() => {
        return () => clearTimer();
    }, [clearTimer]);

    // 快捷方法
    const success = useCallback((title: string, message: string, duration?: number) => {
        showMessage({ type: "success", title, message, duration });
    }, [showMessage]);

    const error = useCallback((title: string, message: string, duration?: number) => {
        showMessage({ type: "error", title, message, duration });
    }, [showMessage]);

    const warning = useCallback((title: string, message: string, duration?: number) => {
        showMessage({ type: "warning", title, message, duration });
    }, [showMessage]);

    const info = useCallback((title: string, message: string, duration?: number) => {
        showMessage({ type: "info", title, message, duration });
    }, [showMessage]);

    return (
        <MessageContext.Provider value={{ showMessage, success, error, warning, info }}>
            {children}
            {isVisible && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-99999">
                    <div
                        className={`transform transition-all duration-300 ease-out ${
                            isAnimating
                                ? 'translate-y-0 opacity-100 scale-100'
                                : '-translate-y-4 opacity-0 scale-95'
                        }`}
                    >
                        <div className="shadow-lg rounded-xl min-w-[300px] max-w-[400px]">
                            <Alert
                                variant={config.type}
                                title={config.title}
                                message={config.message}
                            />
                        </div>
                    </div>
                </div>
            )}
        </MessageContext.Provider>
    );
};

export default MessageContext;
