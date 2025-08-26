import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

// Custom hook for using the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    console.warn("useTheme must be used within a ThemeProvider");
    return { theme: "light", toggleTheme: () => {} };
  }
  return context;
}

// Get initial theme from localStorage or system preference
export function getInitialTheme() {
  if (typeof window !== "undefined") {
    // Check localStorage first
    const storedTheme = localStorage.getItem("theme");
    if (typeof storedTheme === "string") {
      return storedTheme;
    }

    // Check system preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }
  
  // Default to light theme
  return "light";
}