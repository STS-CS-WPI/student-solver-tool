import { Fragment } from "react";
import type { Row, Table } from "@tanstack/react-table";
import { ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getColumnLabel } from "./column-metadata";

export type FacetedFilterConfig = {
  columnId: string;
  label?: string;
  options: { label: string; value: string }[];
};

export function filterBySelectedValues<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown,
) {
  const selected = filterValue as string[] | undefined;
  return !selected?.length || selected.includes(String(row.getValue(columnId)));
}

export function DataTableFilters<TData>({
  table,
  filters,
}: {
  table: Table<TData>;
  filters: FacetedFilterConfig[];
}) {
  const groups = filters.flatMap(({ columnId, label, options }) => {
    const column = table.getColumn(columnId);
    return column
      ? [{ column, label: label ?? getColumnLabel(column), options }]
      : [];
  });
  if (groups.length === 0) return null;

  const activeCount = groups.filter(({ column }) =>
    column.getIsFiltered(),
  ).length;

  function clearFilters() {
    const filterIds = new Set(groups.map(({ column }) => column.id));
    table.setColumnFilters((current) =>
      current.filter((filter) => !filterIds.has(filter.id)),
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={
            activeCount ? `Filters, ${activeCount} active` : "Filters"
          }
        >
          <ListFilter aria-hidden="true" /> Filters
          {activeCount > 0 && (
            <Badge variant="secondary" className="px-1.5 tabular-nums">
              {activeCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        aria-label="Filters"
        className="flex max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))] w-max max-w-(--radix-dropdown-menu-content-available-width) flex-col overflow-hidden"
      >
        <div className="min-h-0 overflow-x-hidden overflow-y-auto">
          {groups.map(({ column, label, options }, index) => {
            const selected =
              (column.getFilterValue() as string[] | undefined) ?? [];

            return (
              <Fragment key={column.id}>
                {index > 0 && <DropdownMenuSeparator className="mx-0" />}
                <DropdownMenuGroup aria-label={label}>
                  <DropdownMenuLabel>{label}</DropdownMenuLabel>
                  {options.map(({ label, value }) => (
                    <DropdownMenuCheckboxItem
                      key={value}
                      checked={selected.includes(value)}
                      onSelect={(event) => event.preventDefault()}
                      onCheckedChange={(checked) => {
                        const next = checked
                          ? [...selected, value]
                          : selected.filter((entry) => entry !== value);
                        column.setFilterValue(
                          next.length > 0 ? next : undefined,
                        );
                      }}
                    >
                      {label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </Fragment>
            );
          })}
        </div>
        <div className="shrink-0">
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={activeCount === 0}
            onSelect={clearFilters}
          >
            Clear filters
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
