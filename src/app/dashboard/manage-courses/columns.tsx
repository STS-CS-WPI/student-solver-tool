"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CopyButton } from "@/components/copy-button";
import { filterBySelectedValues } from "@/components/data-table/data-table-filters";
import { ManagementColumnHeader } from "@/components/data-table/management-column-header";
import {
  formatTableText,
  TableValue,
} from "@/components/data-table/table-value";
import { Badge } from "@/components/ui/badge";
import { unknownProfessorName } from "@/lib/constants";
import { humanizeKey, toFullCourseName } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";
import { CourseTableRowAction } from "./course-table-row-actions";

export type CourseRow =
  RouterOutputs["courses"]["getAllCourses"]["courses"][number];

export function getCourseLabel(course: CourseRow) {
  return toFullCourseName(
    course.courseCode,
    course.courseSection,
    course.courseTitle,
  );
}

function getProfessorName(course: CourseRow) {
  return course.professorName === unknownProfessorName
    ? undefined
    : course.professorName;
}

export const createColumns = (): ColumnDef<CourseRow>[] => [
  {
    accessorKey: "courseTitle",
    meta: { label: "Title", exportValue: getCourseLabel },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
    cell: ({ row }) => <TableValue value={getCourseLabel(row.original)} />,
    filterFn: (row, _, filterValue) => {
      const query = String(filterValue ?? "")
        .trim()
        .toLowerCase();
      return [
        getCourseLabel(row.original),
        row.original.professorName,
        row.original.professorEmail,
      ].some((value) => value.toLowerCase().includes(query));
    },
  },
  {
    id: "professorName",
    accessorFn: getProfessorName,
    meta: {
      label: "Professor",
      exportValue: (course) =>
        formatTableText(
          getProfessorName(course),
          course.professorId ? "Not set" : "Unassigned",
        ),
    },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
    sortUndefined: "last",
    filterFn: (row, _, filterValue) => {
      const selected = filterValue as string[] | undefined;
      const status = row.original.professorId ? "assigned" : "unassigned";
      return !selected?.length || selected.includes(status);
    },
    cell: ({ row, getValue }) => {
      const { professorEmail, professorId } = row.original;
      const email = professorEmail.trim();
      return (
        <div className="flex items-center gap-2">
          {email && (
            <CopyButton
              value={email}
              showErrorToast
              title="Copy professor email"
              aria-label="Copy professor email"
            />
          )}
          <TableValue
            value={getValue<string | undefined>()}
            emptyLabel={professorId ? "Not set" : "Unassigned"}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "enrollment",
    meta: { label: "Enrollment" },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
    cell: ({ row }) => `${row.original.enrollment}/${row.original.capacity}`,
  },
  {
    accessorKey: "requiredHours",
    meta: { label: "Required hours" },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
    cell: ({ row }) => `${row.original.requiredHours} hrs`,
  },
  {
    accessorKey: "academicLevel",
    meta: {
      label: "Academic level",
      exportValue: (course) => humanizeKey(course.academicLevel),
    },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
    cell: ({ row }) => (
      <Badge variant="outline">{humanizeKey(row.original.academicLevel)}</Badge>
    ),
    filterFn: filterBySelectedValues,
  },
  {
    id: "actions",
    meta: { export: false },
    enableHiding: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <CourseTableRowAction course={row.original} />,
  },
];
