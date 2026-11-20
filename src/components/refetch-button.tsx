"use client";
import { RefreshCwIcon } from "lucide-react";
import { Button, type ButtonProps } from "./ui/button";

type Refetchable = {
  refetch: () => void;
  isRefetching: boolean;
};

export function RefetchButton({
  query,
  children,
  iconOnly = false,
  disabled,
  ...props
}: {
  query: Refetchable;
  iconOnly?: boolean;
} & ButtonProps) {
  const { refetch, isRefetching } = query;

  return (
    <Button
      type="button"
      variant={iconOnly ? "ghost" : "outline"}
      size={iconOnly ? "icon" : undefined}
      title={iconOnly ? "Refresh" : undefined}
      aria-label={iconOnly ? "Refresh" : undefined}
      aria-busy={isRefetching}
      {...props}
      onClick={() => refetch()}
      disabled={isRefetching || disabled}
    >
      <RefreshCwIcon
        aria-hidden="true"
        className={isRefetching ? "animate-spin" : ""}
      />
      {!iconOnly && (children ?? "Re-fetch")}
    </Button>
  );
}
