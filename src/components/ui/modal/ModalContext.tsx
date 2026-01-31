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

    const getButtonVariant = (): "primary" | "outline" => {
        return "primary";
    };

    const getButtonColor = (type?: ModalType) => {
        switch (type) {
            case "danger":
                return "bg-red-600 hover:bg-red-700 text-white";
            case "warning":
                return "bg-yellow-500 hover:bg-yellow-600 text-white";
            case "success":
                return "bg-green-500 hover:bg-green-600 text-white";
            default:
                return "";
        }
    };

    const config = modalState.config as ConfirmConfig;

    return (
        <ModalContext.Provider value={{ confirm, alert }}>
            {children}
            <Modal
                isOpen={modalState.isOpen}
                onClose={handleClose}
                className="relative w-full max-w-[340px] m-5 sm:m-0 rounded-3xl bg-white p-6 dark:bg-gray-900"
                closeOnClickOutside={false}
            >
                <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
                    {config.title || (modalState.type === "confirm" ? "确认操作" : "提示")}
                </h2>
                <p className="mb-6 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {config.message}
                </p>
                <div className="flex justify-end gap-3">
                    {modalState.type === "confirm" && (
                        <Button variant="outline" onClick={handleClose}>
                            {config.cancelText || "取消"}
                        </Button>
                    )}
                    <Button
                        variant={getButtonVariant()}
                        onClick={modalState.type === "confirm" ? handleConfirm : handleClose}
                        className={getButtonColor(config.type)}
                    >
                        {modalState.type === "confirm"
                            ? config.confirmText || "确认"
                            : (config as AlertConfig).buttonText || "知道了"}
                    </Button>
                </div>
            </Modal>
        </ModalContext.Provider>
    );
};

export default ModalContext;
