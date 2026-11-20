import { type Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  isSelectable: boolean;
  management?: boolean;
}

export function DataTablePagination<TData>({
  table,
  isSelectable,
  management = false,
}: DataTablePaginationProps<TData>) {
  const rowCount = table.getFilteredRowModel().rows.length;
  if (management && rowCount === 0) return null;

  const buttonSizeClass = management ? undefined : "size-8";

  return (
    <div
      className={cn(
        "flex items-center justify-between",
        management ? "flex-wrap gap-x-4 gap-y-2" : "px-2",
      )}
    >
      <div
        className={cn("text-muted-foreground text-sm", !management && "flex-1")}
        role={management ? "status" : undefined}
      >
        {isSelectable ? (
          <>
            {table.getFilteredSelectedRowModel().rows.length} of {rowCount}{" "}
            row(s) selected.
          </>
        ) : (
          <>{rowCount} row(s)</>
        )}
      </div>
      <div
        className={
          management
            ? "ml-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-2 sm:gap-x-6 lg:gap-x-8"
            : "flex items-center space-x-6 lg:space-x-8"
        }
      >
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger
              className={cn("w-[70px]", !management && "h-8")}
              aria-label="Rows per page"
            >
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent
              position={management ? undefined : "popper"}
              side={management ? undefined : "top"}
            >
              <SelectGroup>
                {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div
          className={
            management
              ? "text-sm font-medium whitespace-nowrap sm:w-[100px] sm:text-center"
              : "flex w-[100px] items-center justify-center text-sm font-medium"
          }
        >
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div
          className={cn(
            "flex items-center",
            management ? "gap-2" : "space-x-2",
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn("hidden lg:flex", buttonSizeClass)}
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={buttonSizeClass}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={buttonSizeClass}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn("hidden lg:flex", buttonSizeClass)}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
