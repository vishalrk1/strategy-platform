"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun, Monitor, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";

const menuVariants = {
  closed: {
    height: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      when: "afterChildren",
    },
  },
  open: {
    height: "auto",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  closed: {
    y: 10,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
  open: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.1,
    },
  },
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();
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
        return <Sun className="h-6 w-6" />;
      case "dark":
        return <Moon className="h-6 w-6" />;
      default:
        return <Monitor className="h-6 w-6" />;
    }
  };

  return (
    <motion.nav
      initial={false}
      className="fixed top-0 z-50 w-full bg-black-a6 bg-opacity-100 py-2 backdrop-blur-sm"
    >
      <div className="flex h-[40px] items-center justify-between px-6 pl-12 md:h-[60px] md:px-32">
        <Link
          href="/"
          className="max-w-screen-xl font-semibold text-xl text-white-a12 hover:text-white-a12 md:text-2xl"
        >
          Pro AlgoMaps
        </Link>
        <div
          className={`hidden items-center md:flex ${
            isAuthenticated ? "space-x-4" : "space-x-2"
          }`}
        >
          {isAuthenticated ? (
            <>
              <motion.span
                transition={{
                  delay: 0.3,
                  ease: "easeInOut",
                  duration: 0.2,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-light text-white text-sm"
              >
                {user?.name || user?.email}
              </motion.span>{" "}
              <motion.button
                transition={{
                  delay: 0.4,
                  ease: "easeInOut",
                  duration: 0.2,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="cursor-pointer border bg-accent/50 shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 px-4 py-1 rounded-md font-light text-white text-lg transition-all duration-200 ease-in hover:opacity-50"
              >
                Logout
              </motion.button>
              <motion.button
                transition={{
                  delay: 0.5,
                  ease: "easeInOut",
                  duration: 0.2,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={toggleTheme}
                className="text-white hover:opacity-50 transition-all duration-200 cursor-pointer"
              >
                {getThemeIcon()}
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                transition={{
                  delay: 0.4,
                  ease: "easeInOut",
                  duration: 0.2,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => router.push("/login")}
                className="font-light text-white text-xl transition-all duration-200 ease-in hover:opacity-50 border border-transparent hover:border hover:bg-accent/50 hover:shadow-xs px-4 py-1 rounded-md cursore-pointer"
              >
                Login
              </motion.button>
              <motion.button
                transition={{
                  delay: 0.5,
                  ease: "easeInOut",
                  duration: 0.2,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => router.push("/register")}
                className="font-light text-white text-xl transition-all duration-200 ease-in hover:opacity-50 border border-transparent hover:border hover:bg-accent/50 hover:shadow-xs px-4 py-1 rounded-md cursore-pointer"
              >
                Register
              </motion.button>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="block md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6 cursor-pointer text-white" />
        </button>
      </div>
      <AnimatePresence mode="sync">
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="overflow-hidden md:hidden"
          >
            <motion.div className="flex flex-col items-center space-y-4 bg-black-a6 bg-opacity-90 py-4">
              <motion.button
                variants={itemVariants}
                onClick={toggleTheme}
                className="text-white hover:opacity-50 transition-all duration-200"
              >
                {getThemeIcon()}
              </motion.button>
              {isAuthenticated ? (
                <>
                  <motion.span
                    variants={itemVariants}
                    className="font-light text-lg text-white"
                  >
                    {user?.name || user?.email}
                  </motion.span>
                  <motion.button
                    variants={itemVariants}
                    onClick={() => {
                      logout();
                      router.push("/");
                      setIsOpen(false);
                    }}
                    className="font-light text-lg text-white transition-all duration-200 ease-in hover:opacity-50"
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    variants={itemVariants}
                    onClick={() => {
                      router.push("/login");
                      setIsOpen(false);
                    }}
                    className="font-light text-lg text-white transition-all duration-200 ease-in hover:opacity-50"
                  >
                    Login
                  </motion.button>
                  <motion.button
                    variants={itemVariants}
                    onClick={() => {
                      router.push("/register");
                      setIsOpen(false);
                    }}
                    className="font-light text-lg text-white transition-all duration-200 ease-in hover:opacity-50"
                  >
                    Register
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
