import { cn } from "@/lib/utils";

type EmptyLabel = "Not set" | "Unassigned";

export function formatTableText(
  value: string | null | undefined,
  emptyLabel: EmptyLabel = "Not set",
) {
  const text = value?.trim();
  return text?.length ? text : emptyLabel;
}

export function TableValue({
  value,
  emptyLabel = "Not set",
  className,
}: {
  value?: string | null;
  emptyLabel?: EmptyLabel;
  className?: string;
}) {
  const text = value?.trim();
  const isMissing = !text;

  return (
    <span className={cn(isMissing && "text-muted-foreground", className)}>
      {isMissing ? emptyLabel : text}
    </span>
  );
}
