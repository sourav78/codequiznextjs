// app/providers.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ToastProvider
        toastProps={{
          classNames: {
            title: "font-poppins",
          }
        }}
        placement="bottom-center"
      />
      {children}
    </NextThemesProvider>
  )
}