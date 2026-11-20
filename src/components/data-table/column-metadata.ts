import type { Column, RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    export?: boolean;
    exportValue?: (row: TData, value: TValue) => unknown;
  }
}

export function getColumnLabel<TData, TValue>(column: Column<TData, TValue>) {
  return (
    column.columnDef.meta?.label ??
    (typeof column.columnDef.header === "string"
      ? column.columnDef.header
      : column.id)
  );
}
