"use client";

import type React from "react";
import {useEffect, useState} from "react";
import {Theme, ThemeContext, ThemeContextType} from "./ThemeContextCore";

export type {Theme, ThemeContextType};
export {ThemeContext};

const availableThemes: Theme[] = ["light", "dark", "asuka"];

const isValidTheme = (theme: string | null): theme is Theme => {
    return theme !== null && availableThemes.includes(theme as Theme);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                           children,
                                                                       }) => {
    const [theme, setTheme] = useState<Theme>("light");
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // This code will only run on the client side
        const savedTheme = localStorage.getItem("theme");
        const initialTheme = isValidTheme(savedTheme) ? savedTheme : "light";

        setTheme(initialTheme);
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("theme", theme);
            const rootElement = document.documentElement;
            const bodyElement = document.body;

            rootElement.classList.remove("dark", "asuka");
            rootElement.setAttribute("data-theme", theme);
            bodyElement.setAttribute("data-theme", theme);

            if (theme === "dark") {
                rootElement.classList.add("dark");
                rootElement.style.colorScheme = "dark";
                bodyElement.style.colorScheme = "dark";
                return;
            }

            if (theme === "asuka") {
                // Asuka builds on dark primitives, then applies branded overrides.
                rootElement.classList.add("dark", "asuka");
                rootElement.style.colorScheme = "dark";
                bodyElement.style.colorScheme = "dark";
                return;
            }

            rootElement.style.colorScheme = "light";
            bodyElement.style.colorScheme = "light";
        }
    }, [theme, isInitialized]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    const cycleTheme = () => {
        setTheme((prevTheme) => {
            if (prevTheme === "light") return "dark";
            if (prevTheme === "dark") return "asuka";
            return "light";
        });
    };

    return (
        <ThemeContext.Provider value={{theme, setTheme, toggleTheme, cycleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};


