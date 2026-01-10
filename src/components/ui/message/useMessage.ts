import { useContext } from "react";
import MessageContext, { MessageContextType } from "./MessageContext";

// 自定义 Hook
export const useMessage = (): MessageContextType => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error("useMessage must be used within a MessageProvider");
    }
    return context;
};
