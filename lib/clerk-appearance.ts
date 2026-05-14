import { dark } from "@clerk/ui/themes";

export const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorBackground: "var(--bg-elevated)",
    colorDanger: "var(--state-error)",
    colorInputBackground: "var(--bg-surface)",
    colorInputText: "var(--text-primary)",
    colorPrimary: "var(--accent-primary)",
    colorText: "var(--text-primary)",
    colorTextSecondary: "var(--text-secondary)",
    colorNeutral: "var(--text-muted)",
    borderRadius: "var(--radius)",
    fontFamily: "var(--font-geist-sans)",
  },
  elements: {
    cardBox: "border border-surface-border bg-elevated shadow-2xl",
    footerActionLink: "text-brand hover:text-brand",
    formButtonPrimary:
      "bg-brand text-primary-foreground hover:bg-brand/90 shadow-none",
    formFieldInput:
      "border-surface-border bg-surface text-copy-primary shadow-none",
    headerSubtitle: "text-copy-muted",
    headerTitle: "text-copy-primary",
    socialButtonsBlockButton:
      "border-surface-border bg-surface text-copy-primary hover:bg-subtle",
  },
};
