import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import {
  afterSignInPath,
  afterSignUpPath,
  signInPath,
  signUpPath,
} from "@/lib/auth-routes";
import { dark } from "@clerk/ui/themes";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "Collaborative AI system design workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorBackground: "var(--color-base)",
          colorNeutral: "var(--color-copy-primary)",
          colorPrimary: "var(--color-brand)",
          colorPrimaryForeground: "var(--color-base)",
          colorForeground: "var(--color-foreground)",
          colorInput: "var(--color-elevated)",
          colorInputForeground: "var(--color-foreground)",
          colorDanger: "var(--color-state-error)",
          colorSuccess: "var(--color-state-success)",
          colorWarning: "var(--color-state-warning)",
          borderRadius: "var(--radius-lg)",
          fontFamily: "var(--font-sans)",
        }
      }}
      signInUrl={signInPath}
      signUpUrl={signUpPath}
      signInFallbackRedirectUrl={afterSignInPath}
      signUpFallbackRedirectUrl={afterSignUpPath}
      afterSignOutUrl={signInPath}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
