"use client";

import { useRef, useState, type ReactNode, type Ref } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function useRowActionsMenu<TDialog extends string>() {
  const [activeDialog, setActiveDialog] = useState<TDialog | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openingDialog = useRef(false);

  function restoreTriggerFocus(event: Event) {
    event.preventDefault();
    triggerRef.current?.focus();
  }

  function getDialogProps(dialog: TDialog) {
    return {
      open: activeDialog === dialog,
      onOpenChange: (open: boolean) => {
        setActiveDialog((current) =>
          open ? dialog : current === dialog ? null : current,
        );
      },
    };
  }

  return {
    openDialog: (dialog: TDialog) => {
      openingDialog.current = true;
      setActiveDialog(dialog);
    },
    getDialogProps,
    dialogContentProps: { onCloseAutoFocus: restoreTriggerFocus },
    menuProps: {
      triggerRef,
      onCloseAutoFocus: (event: Event) => {
        if (openingDialog.current) {
          event.preventDefault();
          openingDialog.current = false;
        }
      },
    },
  };
}

export function RowActionsMenu({
  children,
  label,
  triggerRef,
  onCloseAutoFocus,
}: {
  children: ReactNode;
  label: string;
  triggerRef: Ref<HTMLButtonElement>;
  onCloseAutoFocus: (event: Event) => void;
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={triggerRef}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
          >
            <MoreHorizontalIcon aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onCloseAutoFocus={onCloseAutoFocus}>
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
