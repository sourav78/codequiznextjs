"use client";

import { useTheme } from "next-themes";
import { Button } from "@heroui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {

  // useState to track if the component has mounted
  const [mounted, setMounted] = useState(false);

  // useTheme to get the current theme
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // If the component has not mounted, return null
  if (!mounted) {
    return null;
  }

  return (
    <Button
      isIconOnly
      variant="light"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {/* If the theme is dark, show the sun icon, otherwise show the moon icon */}
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}