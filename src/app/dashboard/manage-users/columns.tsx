"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, CheckIcon, XIcon } from "lucide-react";
import { RoleBadges } from "@/components/role-badge";

import { CopyButton } from "@/components/copy-button";
import { DataTableColumnHeader } from "@/components/data-table";
import type { UserTableRow } from "./manage-users-content";
import { UserTableRowAction } from "./user-table-row-actions";
import { isAssistant } from "@/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { GlobalSuspense } from "@/components/global-suspense";
import StaffDashboardFormSumary from "@/components/staff/staff-dashboard-form-summary";
import { CoursesCard } from "@/components/professor/professor-dashboard/courses-card";

export const createColumns = (
  selectedTermId: string,
): ColumnDef<UserTableRow>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.name}</div>;
    },
    filterFn: (row, _, filterValue) => {
      const term = String(filterValue ?? "").toLowerCase();
      if (!term) return true;

      const name = (row.getValue<string>("name") ?? "").toLowerCase();
      const email = (row.getValue<string>("email") ?? "").toLowerCase();

      return name.includes(term) || email.includes(term);
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.original.email ?? "";
      const name = row.original.name ?? "";
      return (
        <div className="flex items-center gap-2">
          <CopyButton value={email} title="Copy email" />
          <Button
            asChild
            variant="link"
            className="text-foreground p-0"
            title={`Send email to ${name}`}
          >
            <a href={`mailto:${email}`}>{email}</a>
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "roles",
    header: "Role",
    cell: ({ row }) => {
      const roles = row.original.roles ?? [];
      return <RoleBadges roles={roles} />;
    },
    filterFn: "arrIncludesSome",
  },
  {
    accessorKey: "hasPreference",
    header: "Preference form status",
    filterFn: (row, columnId, filterValue) => {
      const selected = filterValue as string[] | undefined;
      if (!selected || selected.length === 0) return true;

      const value = row.getValue<boolean>(columnId);
      const valueAsString = value ? "true" : "false";
      return selected.includes(valueAsString);
    },
    cell: ({ row }) => {
      const hasPreference = row.original.hasPreference;
      const userId = row.original.id;
      const isStaff = isAssistant(row.original);

      return (
        <HoverCard>
          <HoverCardTrigger>
            <Badge
              variant={hasPreference ? "success" : "warning"}
              className="hover:underline"
            >
              {hasPreference ? (
                <>
                  <CheckIcon /> Submitted
                </>
              ) : (
                <>
                  <XIcon /> Not submitted
                </>
              )}
            </Badge>
          </HoverCardTrigger>
          <HoverCardContent className="max-h-[45vh] w-xl overflow-y-auto p-4">
            <GlobalSuspense>
              {!hasPreference ? (
                <p>
                  Not submitted yet. You can manually edit their preferences by
                  clicking the &quot;...&quot; button. After their preferences
                  are filled out, you will see them here.
                </p>
              ) : isStaff ? (
                <StaffDashboardFormSumary
                  userId={userId}
                  termId={selectedTermId}
                />
              ) : (
                <CoursesCard
                  termId={selectedTermId}
                  professorId={userId}
                  isSubmitted={hasPreference}
                />
              )}
            </GlobalSuspense>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },
  {
    accessorKey: "locked",
    header: "Preference form access",
    cell: ({ row }) => {
      const locked = row.original.locked;

      return (
        <Badge variant={locked ? "warning" : "secondary"}>
          {locked ? (
            <>
              <Lock /> Locked
            </>
          ) : (
            <>
              <Unlock /> Unlocked
            </>
          )}
        </Badge>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      const selected = filterValue as string[] | undefined;
      if (!selected || selected.length === 0) return true;

      const value = row.getValue<boolean>(columnId);
      const valueAsString = value ? "true" : "false";
      return selected.includes(valueAsString);
    },
  },
  {
    id: "actions",
    meta: { export: false },
    cell: ({ row }) => (
      <UserTableRowAction termId={selectedTermId} user={row.original} />
    ),
  },
];
