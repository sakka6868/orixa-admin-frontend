import React, { ReactNode } from "react";
import { cn } from "../../../utils";

interface ModalBodyProps {
    children: ReactNode;
    className?: string;
}

const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => {
    return (
        <div className={cn("space-y-4", className)}>
            {children}
        </div>
    );
};

export default ModalBody;
