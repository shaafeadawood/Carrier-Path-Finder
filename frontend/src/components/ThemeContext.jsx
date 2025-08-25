import React, { useEffect, useState } from "react";
import { getInitialTheme } from "./ThemeContextUtils";
import { ThemeContext } from "./ThemeContext.js";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme to document element and save to localStorage
  useEffect(() => {
    try {
      // Remove all theme classes and add the current one
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(theme);
      
      // Save theme preference
      localStorage.setItem("theme", theme);
      
      // Dispatch storage event to notify other components/tabs
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'theme',
        newValue: theme,
        oldValue: theme === 'dark' ? 'light' : 'dark',
        storageArea: localStorage
      }));
      
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  }, [theme]);

  const toggleTheme = () => {
    console.log("[ThemeContext] Toggle theme called, current theme:", theme);
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Listen for theme changes across tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'theme') {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(event.newValue);
    }
  });
}
