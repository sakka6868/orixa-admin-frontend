import React, { ReactNode } from "react";
import { cn } from "../../../utils";

interface ModalFooterProps {
    children: ReactNode;
    variant?: "default" | "centered" | "spread";
    className?: string;
}

const variantClasses = {
    default:
        "mt-8 flex flex-col-reverse sm:flex-row w-full items-center justify-end gap-3",
    centered:
        "mt-8 flex w-full items-center justify-center gap-3",
    spread:
        "mt-8 flex flex-col-reverse sm:flex-row w-full items-center justify-between gap-3",
};

const ModalFooter: React.FC<ModalFooterProps> = ({
    children,
    variant = "default",
    className,
}) => {
    return (
        <div className={cn(variantClasses[variant], className)}>
            {children}
        </div>
    );
};

export default ModalFooter;
