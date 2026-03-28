import React, { createContext, useState, useCallback, ReactNode } from "react";
import { Modal } from "./Modal";
import Button from "../button/Button";

type ModalType = "danger" | "warning" | "info" | "success";

interface ConfirmConfig {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: ModalType;
}

interface AlertConfig {
    title?: string;
    message: string;
    buttonText?: string;
    type?: ModalType;
}

export interface ModalContextType {
    confirm: (config: ConfirmConfig) => Promise<boolean>;
    alert: (config: AlertConfig) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | null>(null);

interface ModalProviderProps {
    children: ReactNode;
}

interface ModalState {
    isOpen: boolean;
    type: "confirm" | "alert";
    config: ConfirmConfig | AlertConfig;
    resolve?: (value: boolean | void) => void;
}

// Type icon configurations
const typeIconConfig: Record<ModalType, { bgClass: string; iconClass: string; path: string }> = {
    danger: {
        bgClass: "bg-error-50 dark:bg-error-500/15",
        iconClass: "text-error-600 dark:text-error-500",
        path: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z",
    },
    warning: {
        bgClass: "bg-warning-50 dark:bg-warning-500/15",
        iconClass: "text-warning-600 dark:text-warning-500",
        path: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z",
    },
    success: {
        bgClass: "bg-success-50 dark:bg-success-500/15",
        iconClass: "text-success-600 dark:text-success-500",
        path: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    },
    info: {
        bgClass: "bg-brand-50 dark:bg-brand-500/15",
        iconClass: "text-brand-600 dark:text-brand-500",
        path: "M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z",
    },
};

const TypeIcon: React.FC<{ type?: ModalType }> = ({ type }) => {
    if (!type) return null;
    const config = typeIconConfig[type];
    return (
        <div className="mb-5 flex justify-center">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${config.bgClass}`}>
                <svg
                    className={`h-6 w-6 ${config.iconClass}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d={config.path} />
                </svg>
            </div>
        </div>
    );
};

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        type: "confirm",
        config: { message: "" },
    });

    const confirm = useCallback((config: ConfirmConfig): Promise<boolean> => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                type: "confirm",
                config,
                resolve: (value: boolean | void) => resolve(value as boolean),
            });
        });
    }, []);

    const alert = useCallback((config: AlertConfig): Promise<void> => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                type: "alert",
                config,
                resolve: () => resolve(),
            });
        });
    }, []);

    const handleClose = useCallback(() => {
        if (modalState.resolve) {
            modalState.resolve(false);
        }
        setModalState((prev) => ({ ...prev, isOpen: false }));
    }, [modalState.resolve]);

    const handleConfirm = useCallback(() => {
        if (modalState.resolve) {
            modalState.resolve(true);
        }
        setModalState((prev) => ({ ...prev, isOpen: false }));
    }, [modalState.resolve]);

    const getConfirmButtonVariant = (type?: ModalType): "primary" | "danger" => {
        return type === "danger" ? "danger" : "primary";
    };

    const config = modalState.config as ConfirmConfig;

    return (
        <ModalContext.Provider value={{ confirm, alert }}>
            {children}
            <Modal
                isOpen={modalState.isOpen}
                onClose={handleClose}
                className="w-full max-w-[400px] p-6 lg:p-8"
                closeOnClickOutside={false}
            >
                <div className={config.type ? "text-center" : ""}>
                    <TypeIcon type={config.type} />
                    <h4 className="text-title-sm mb-2 font-semibold text-gray-800 dark:text-white/90">
                        {config.title || (modalState.type === "confirm" ? "确认操作" : "提示")}
                    </h4>
                    <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                        {config.message}
                    </p>
                    <div className={`flex gap-3 ${config.type ? "justify-center" : "justify-end"}`}>
                        {modalState.type === "confirm" && (
                            <Button variant="outline" onClick={handleClose}>
                                {config.cancelText || "取消"}
                            </Button>
                        )}
                        <Button
                            variant={getConfirmButtonVariant(config.type)}
                            onClick={modalState.type === "confirm" ? handleConfirm : handleClose}
                        >
                            {modalState.type === "confirm"
                                ? config.confirmText || "确认"
                                : (config as AlertConfig).buttonText || "知道了"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </ModalContext.Provider>
    );
};

export default ModalContext;
