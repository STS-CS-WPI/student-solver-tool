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
  title,
}: {
  value?: string | number | null;
  emptyLabel?: EmptyLabel;
  className?: string;
  title?: string;
}) {
  const text = typeof value === "string" ? value.trim() : value;
  const isMissing = text == null || text === "";

  return (
    <span
      className={cn(isMissing && "text-muted-foreground", className)}
      title={title}
    >
      {isMissing ? emptyLabel : text}
    </span>
  );
}
