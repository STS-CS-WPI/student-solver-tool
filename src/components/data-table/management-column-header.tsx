import { type Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getColumnLabel } from "./column-metadata";

interface ManagementColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
}

export function ManagementColumnHeader<TData, TValue>({
  column,
}: ManagementColumnHeaderProps<TData, TValue>) {
  const label = getColumnLabel(column);
  const sortDirection = column.getIsSorted();
  const nextAction =
    sortDirection === "asc"
      ? "Sort descending"
      : sortDirection === "desc"
        ? "Clear sorting"
        : "Sort ascending";

  if (!column.getCanSort()) {
    return <span>{label}</span>;
  }

  return (
    <div className="flex items-center">
      <Button
        type="button"
        variant="ghost"
        className="-ml-3"
        title={nextAction}
        aria-label={`${label}: ${nextAction}`}
        onClick={() => {
          if (sortDirection === "desc") column.clearSorting();
          else column.toggleSorting(sortDirection === "asc");
        }}
      >
        <span>{label}</span>
        {sortDirection === "desc" ? (
          <ArrowDown aria-hidden="true" />
        ) : sortDirection === "asc" ? (
          <ArrowUp aria-hidden="true" />
        ) : (
          <ArrowUpDown aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
