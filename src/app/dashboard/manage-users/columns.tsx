"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, CheckIcon, XIcon } from "lucide-react";
import { RoleBadges } from "@/components/role-badge";

import { CopyButton } from "@/components/copy-button";
import { ManagementColumnHeader } from "@/components/data-table/management-column-header";
import { filterBySelectedValues } from "@/components/data-table/data-table-filters";
import {
  formatTableText,
  TableValue,
} from "@/components/data-table/table-value";
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

export function getUserLabel(user: UserTableRow) {
  return [user.name?.trim(), user.email?.trim()].find(Boolean) ?? "user";
}

export const createColumns = (
  selectedTermId: string,
): ColumnDef<UserTableRow>[] => [
  {
    accessorKey: "name",
    meta: { label: "Name", exportValue: (user) => formatTableText(user.name) },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
    cell: ({ row }) => (
      <TableValue value={row.original.name} className="font-medium" />
    ),
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
    meta: {
      label: "Email",
      exportValue: (user) => formatTableText(user.email),
    },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
    cell: ({ row }) => {
      const email = row.original.email?.trim();
      if (!email) return <TableValue />;
      return (
        <div className="flex items-center gap-2">
          <CopyButton
            value={email}
            showErrorToast
            title="Copy email"
            aria-label={`Copy ${email}`}
          />
          <Button
            asChild
            variant="link"
            className="text-foreground p-0"
            title={`Send email to ${getUserLabel(row.original)}`}
          >
            <a href={`mailto:${email}`}>{email}</a>
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "roles",
    meta: {
      label: "Roles",
      exportValue: (user) => formatTableText(user.roles.join("; ")),
    },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
    sortingFn: (a, b) =>
      a.original.roles.join(", ").localeCompare(b.original.roles.join(", ")),
    cell: ({ row }) => {
      const roles = row.original.roles ?? [];
      return roles.length ? <RoleBadges roles={roles} /> : <TableValue />;
    },
    filterFn: "arrIncludesSome",
  },
  {
    accessorKey: "hasPreference",
    meta: {
      label: "Preference form status",
      exportValue: (user) =>
        user.hasPreference ? "Submitted" : "Not submitted",
    },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
    filterFn: filterBySelectedValues,
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
    meta: {
      label: "Preference form access",
      exportValue: (user) => (user.locked ? "Locked" : "Unlocked"),
    },
    header: ({ column }) => <ManagementColumnHeader column={column} />,
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
    filterFn: filterBySelectedValues,
  },
  {
    id: "actions",
    meta: { export: false },
    enableHiding: false,
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <UserTableRowAction
        termId={selectedTermId}
        user={row.original}
        label={getUserLabel(row.original)}
      />
    ),
  },
];
