import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { pb } from "../lib/pocketbase";
import { useAuth } from "./AuthContext";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Este navegador ya tiene una preferencia local (localStorage) es siempre
  // la fuente de verdad al recargar: si dependiéramos del valor guardado en
  // la cuenta, un guardado en segundo plano que todavía no terminó de viajar
  // al servidor (ej. si recargas justo después de cambiar el color) haría
  // que se restaurara el color viejo. La cuenta solo sirve para sembrar la
  // preferencia en un dispositivo nuevo que nunca ha elegido ninguna, y para
  // corregirse a sí misma si quedó desactualizada.
  useEffect(() => {
    if (!user) {
      syncedUserId.current = null;
      return;
    }
    if (syncedUserId.current === user.id) return;
    syncedUserId.current = user.id;

    const hasLocalPreference = localStorage.getItem("theme") !== null;
    if (!hasLocalPreference && (user.theme === "light" || user.theme === "dark")) {
      setTheme(user.theme);
    } else if (user.theme !== theme) {
      pb.collection("users")
        .update(user.id, { theme })
        .catch(() => {});
    }
  }, [user, theme]);

  function toggleTheme() {
    setTheme((t) => {
      const next: Theme = t === "dark" ? "light" : "dark";
      if (user) {
        pb.collection("users")
          .update(user.id, { theme: next })
          .catch(() => {});
      }
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
