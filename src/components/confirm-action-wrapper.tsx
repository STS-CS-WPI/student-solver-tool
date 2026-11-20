import type { ComponentProps, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function Confirm({
  children,
  action,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Continue",
  confirmVariant = "default",
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  children?: ReactNode;
  action: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  confirmVariant?: "default" | "destructive";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCloseAutoFocus?: ComponentProps<
    typeof AlertDialogContent
  >["onCloseAutoFocus"];
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      <AlertDialogContent onCloseAutoFocus={onCloseAutoFocus}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={confirmVariant} onClick={action}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
