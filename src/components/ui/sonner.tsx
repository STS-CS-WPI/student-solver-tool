"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const isMobile = useIsMobile();

  return (
    <Sonner
      richColors
      closeButton
      position={isMobile ? "top-center" : "bottom-right"}
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          fontFamily: "var(--font-sans)",
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--popover)",
          "--success-border": "var(--border)",
          "--success-text": "var(--success)",

          "--error-bg": "var(--popover)",
          "--error-border": "var(--border)",
          "--error-text": "var(--destructive)",

          "--warning-bg": "var(--popover)",
          "--warning-border": "var(--border)",
          "--warning-text": "var(--warning)",

          "--info-bg": "var(--popover)",
          "--info-text": "var(--popover-foreground)",
          "--info-border": "var(--border)",

          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        duration: 5000,
        classNames: {
          toast:
            "cn-toast focus-visible:border-ring! focus-visible:shadow-[0_4px_12px_rgba(0,0,0,0.1)]! focus-visible:ring-3! focus-visible:ring-ring/50!",
          closeButton:
            "hover:border-border! hover:bg-muted! hover:text-foreground! focus-visible:border-ring! focus-visible:ring-3! focus-visible:ring-ring/50!",
          actionButton: "focus-visible:ring-3! focus-visible:ring-ring/50!",
          cancelButton: "focus-visible:ring-3! focus-visible:ring-ring/50!",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
