"use client";

import type { Row, Table } from "@tanstack/react-table";
import { DownloadIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { downloadTemplateCSV } from "@/lib/download-file";
import {
  DataTableFilters,
  type FacetedFilterConfig,
} from "./data-table-filters";
import { DataTableViewOptions } from "./data-table-view-options";
import { getColumnLabel } from "./column-metadata";

export interface ManagementTableToolbarProps<TData> {
  table: Table<TData>;
  searchColumnId?: keyof TData & string;
  searchPlaceholder?: string;
  facetedFilters?: FacetedFilterConfig[];
  leadingActions?: ReactNode;
  children?: ReactNode;
}

export function ManagementTableToolbar<TData>({
  table,
  searchColumnId,
  searchPlaceholder = "Filter...",
  facetedFilters = [],
  leadingActions,
  children,
}: ManagementTableToolbarProps<TData>) {
  const searchColumn = searchColumnId
    ? table.getColumn(searchColumnId)
    : undefined;
  const rows = table.getPrePaginationRowModel().rows;
  const selectedRows = rows.filter((row) => row.getIsSelected());

  function exportRows(rowsToExport: Row<TData>[], filename: string) {
    const columns = table
      .getVisibleLeafColumns()
      .filter((column) => column.columnDef.meta?.export !== false)
      .map((column) => ({
        id: column.id,
        label: getColumnLabel(column),
        exportValue: column.columnDef.meta?.exportValue,
      }));
    const headers = columns.map(({ label }) => label);
    const data = rowsToExport.map((row) =>
      Object.fromEntries(
        columns.map(({ id, label, exportValue }) => {
          const value = row.getValue(id);
          return [
            label,
            exportValue ? exportValue(row.original, value) : value,
          ];
        }),
      ),
    );

    downloadTemplateCSV(headers, data, filename);
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {searchColumn && (
          <Input
            type="search"
            placeholder={searchPlaceholder}
            aria-label="Search table"
            value={(searchColumn.getFilterValue() as string | undefined) ?? ""}
            onChange={(event) =>
              searchColumn.setFilterValue(event.target.value)
            }
            className="w-[150px] max-w-full lg:w-[250px]"
          />
        )}
        <DataTableFilters table={table} filters={facetedFilters} />
      </div>

      <div className="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
        {leadingActions}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <DataTableViewOptions table={table} management />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Download CSV"
                aria-label="Download CSV"
              >
                <DownloadIcon aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Download options (CSV)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={rows.length === 0}
                onSelect={() => exportRows(rows, "all-filtered-rows.csv")}
              >
                All filtered rows ({rows.length})
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={selectedRows.length === 0}
                onSelect={() => exportRows(selectedRows, "selected-rows.csv")}
              >
                Only selected ({selectedRows.length})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {children}
        </div>
      </div>
    </div>
  );
}
