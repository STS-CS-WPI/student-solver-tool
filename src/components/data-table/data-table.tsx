"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import {
  DataTableToolbar,
  type DataTableToolbarProps,
} from "./data-table-toolbar";
import { Checkbox } from "../ui/checkbox";
import {
  ManagementTableToolbar,
  type ManagementTableToolbarProps,
} from "./management-table-toolbar";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  selectable?: boolean;

  /** Inject actions on the right side of the toolbar */
  renderToolbarActions?: (table: TanstackTable<TData>) => React.ReactNode;
}

type DataTableVariant<TData> =
  | {
      variant?: "default";
      toolbarProps?: Omit<DataTableToolbarProps<TData>, "table">;
    }
  | {
      variant: "management";
      label: string;
      getRowId: (row: TData) => string;
      getRowLabel: (row: TData) => string;
      renderToolbarLeadingActions?: (
        table: TanstackTable<TData>,
      ) => React.ReactNode;
      toolbarProps?: Omit<
        ManagementTableToolbarProps<TData>,
        "table" | "children" | "leadingActions"
      >;
    };

export function DataTable<TData, TValue>({
  columns,
  data,
  selectable = false,
  renderToolbarActions,
  ...variantProps
}: DataTableProps<TData, TValue> & DataTableVariant<TData>) {
  const management = variantProps.variant === "management";
  const getRowLabel = management ? variantProps.getRowLabel : undefined;
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const tableColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!selectable) return columns;
    return [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllRowsSelected() ||
              ((management
                ? table.getFilteredSelectedRowModel().rows.length > 0
                : table.getIsSomeRowsSelected()) &&
                "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
            disabled={
              management && table.getFilteredRowModel().rows.length === 0
            }
            aria-label={management ? "Select all filtered rows" : "Select all"}
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={
              getRowLabel ? `Select ${getRowLabel(row.original)}` : "Select row"
            }
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        meta: { export: false },
      },
      ...columns,
    ];
  }, [columns, selectable, management, getRowLabel]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getRowId: management ? variantProps.getRowId : undefined,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      if (management) table.resetPageIndex();
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    autoResetPageIndex: false,
  });

  const { pageIndex } = table.getState().pagination;
  const lastPageIndex = Math.max(0, table.getPageCount() - 1);
  const rows = table.getRowModel().rows;
  const toolbarActions = renderToolbarActions?.(table);
  const showEmptyState =
    rows.length === 0 &&
    (!management || table.getFilteredRowModel().rows.length === 0);

  React.useEffect(() => {
    if (management && pageIndex > lastPageIndex)
      table.setPageIndex(lastPageIndex);
  }, [management, table, pageIndex, lastPageIndex]);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {management ? (
        <ManagementTableToolbar
          table={table}
          {...variantProps.toolbarProps}
          leadingActions={variantProps.renderToolbarLeadingActions?.(table)}
        >
          {toolbarActions}
        </ManagementTableToolbar>
      ) : (
        <DataTableToolbar table={table} {...variantProps.toolbarProps}>
          {toolbarActions}
        </DataTableToolbar>
      )}
      <div
        className={
          management
            ? "overflow-hidden rounded-md border"
            : "overflow-hidden rounded-md border p-2"
        }
      >
        <Table scrollLabel={management ? variantProps.label : undefined}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortDirection =
                    management && header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      aria-sort={
                        sortDirection === "asc"
                          ? "ascending"
                          : sortDirection === "desc"
                            ? "descending"
                            : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {showEmptyState && (
              <TableRow>
                <TableCell
                  colSpan={
                    management
                      ? table.getVisibleLeafColumns().length
                      : tableColumns.length
                  }
                  className="h-24 text-center"
                >
                  {management
                    ? data.length === 0
                      ? "No rows yet."
                      : "No rows match your filters."
                    : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        table={table}
        isSelectable={selectable}
        management={management}
      />
    </div>
  );
}
