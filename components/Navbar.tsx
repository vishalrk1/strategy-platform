"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { Moon, Sun, Monitor } from "lucide-react";

export function Navbar() {
  const router = useRouter();  const { isAuthenticated, logout, user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-8xl flex items-center justify-between p-4 bg-sidebar/90 backdrop-blur-md shadow-2xl border border-sidebar-border/50 rounded-2xl transition-all duration-300 hover:shadow-xl hover:bg-sidebar/95">
      <div className="flex items-center gap-4">
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => router.push("/")}
        >
          TradeBot Op
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8"
        >
          {getThemeIcon()}
        </Button>
        
        {isAuthenticated ? (
          <>            <span className="text-xs text-muted-foreground">
              {user?.name || user?.email}
            </span>
            <Button
              variant="outline"
              onClick={() => {                logout();
                router.push("/");
              }}
            >
              Logout
            </Button>
          </>
        ) : (          <>            <Button variant="outline" onClick={() => router.push("/login")}>
              Login
            </Button>
            <Button onClick={() => router.push("/register")}>Register</Button>
          </>
        )}
      </div>
    </nav>
  );
}
