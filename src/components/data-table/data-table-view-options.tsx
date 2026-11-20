"use client";

import { type Table } from "@tanstack/react-table";
import { Columns3, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getColumnLabel } from "./column-metadata";

export function DataTableViewOptions<TData>({
  table,
  management = false,
}: {
  table: Table<TData>;
  management?: boolean;
}) {
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.accessorFn && column.getCanHide());
  const visibleColumnCount = columns.filter((column) =>
    column.getIsVisible(),
  ).length;
  if (management && columns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {management ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="Columns"
            aria-label="Columns"
          >
            <Columns3 aria-hidden="true" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
          >
            <Settings2 /> View
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-max max-w-(--radix-dropdown-menu-content-available-width) min-w-37.5"
      >
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => {
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              disabled={
                management && column.getIsVisible() && visibleColumnCount === 1
              }
              onSelect={
                management ? (event) => event.preventDefault() : undefined
              }
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              <span className="min-w-0 wrap-anywhere">
                {getColumnLabel(column)}
              </span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
