"use client";

import {createContext} from "react";

type Theme = "light" | "dark" | "asuka";

type ThemeContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    cycleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export type {Theme, ThemeContextType};
export {ThemeContext};
