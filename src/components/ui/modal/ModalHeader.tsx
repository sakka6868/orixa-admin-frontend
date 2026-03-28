import React, { ReactNode } from "react";
import { cn } from "../../../utils";

interface ModalHeaderProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    centered?: boolean;
    className?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
    title,
    description,
    icon,
    centered = false,
    className,
}) => {
    return (
        <div className={cn(centered && "text-center", className)}>
            {icon && (
                <div
                    className={cn(
                        "mb-5 flex items-center",
                        centered ? "justify-center" : "justify-start"
                    )}
                >
                    {icon}
                </div>
            )}
            <h4 className="text-title-sm mb-1 font-semibold text-gray-800 dark:text-white/90">
                {title}
            </h4>
            {description && (
                <p className="mb-7 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {description}
                </p>
            )}
        </div>
    );
};

export default ModalHeader;
