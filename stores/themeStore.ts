import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = "dark" | "light" | "system";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "system",
      
      setTheme: (theme: Theme) => {
        set({ theme });
        
        // Apply theme to document
        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");

          if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
              .matches
              ? "dark"
              : "light";
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }
        }
      },
      
      initializeTheme: () => {
        const currentTheme = get().theme;
        get().setTheme(currentTheme);
      },
    }),
    {
      name: 'theme-storage',
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          if (typeof window !== "undefined") {
            localStorage.setItem(name, JSON.stringify(value));
          }
        },
        removeItem: (name) => {
          if (typeof window !== "undefined") {
            localStorage.removeItem(name);
          }
        },
      },
    }
  )
);
