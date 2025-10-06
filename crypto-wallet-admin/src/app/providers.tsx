"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { Web3Provider } from "@/providers/web3";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </Web3Provider>
  );
}
