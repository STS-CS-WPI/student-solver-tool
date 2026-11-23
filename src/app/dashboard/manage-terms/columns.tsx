"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { filterBySelectedValues } from "@/components/data-table/data-table-filters";
import { ManagementColumnHeader } from "@/components/data-table/management-column-header";
import { Badge } from "@/components/ui/badge";
import type { RouterOutputs } from "@/trpc/react";
import { TermTableRowActions } from "./term-table-row-actions";

export type TermRow = RouterOutputs["term"]["getTermStats"][number] & {
  name: string;
};

export const createColumns = (): ColumnDef<TermRow>[] => [
  {
    accessorKey: "name",
    meta: { label: "Term name" },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "active",
    meta: {
      label: "Status",
      exportValue: (term) => (term.active ? "Active" : "Inactive"),
    },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
    filterFn: filterBySelectedValues,
    cell: ({ row }) => (
      <Badge variant={row.original.active ? "success" : "secondary"}>
        {row.original.active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "sections",
    accessorFn: (term) => term._count.sections,
    meta: { label: "Sections" },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
  },
  {
    id: "allowedUsers",
    accessorFn: (term) => term._count.allowedUsers,
    meta: { label: "Allowed users" },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
  },
  {
    accessorKey: "termStaffDueDate",
    meta: { label: "Staff due date" },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
    cell: ({ row }) => row.original.termStaffDueDate.toLocaleDateString(),
  },
  {
    accessorKey: "termProfessorDueDate",
    meta: { label: "Professor due date" },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
    cell: ({ row }) => row.original.termProfessorDueDate.toLocaleDateString(),
  },
  {
    id: "actions",
    meta: { export: false },
    enableHiding: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <TermTableRowActions term={row.original} />,
  },
];
