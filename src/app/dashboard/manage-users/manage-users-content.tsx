"use client";

import { useMemo } from "react";
import { Role } from "@prisma/client";
import type { Table } from "@tanstack/react-table";
import { Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import {
  ManagementPage,
  ManagementTableCard,
} from "@/components/dashboard/management-layout";
import { NoTermsAlert } from "@/components/dashboard/no-term-alert";
import { UploadAllowedUsersForm } from "@/components/dashboard/upload-allowed-users-form";
import { DataTable } from "@/components/data-table";
import { RefetchButton } from "@/components/refetch-button";
import { TermCombobox, useTerm, type Term } from "@/components/term-combobox";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { api, type RouterOutputs } from "@/trpc/react";
import { createColumns, getUserLabel } from "./columns";

export type UserTableRow =
  RouterOutputs["staff"]["getAllUsers"]["users"][number];

const roleLabels: Record<Role, string> = {
  PLA: "PLA",
  GLA: "GLA",
  TA: "TA",
  COORDINATOR: "Coordinator",
  PROFESSOR: "Professor",
};

export default function ManageUsersContent() {
  const { selectedTerm } = useTerm();

  if (!selectedTerm) return <NoTermsAlert />;

  return (
    <ManagementPage
      title="Manage Users"
      description={`Managing users for ${selectedTerm.label} term`}
      actions={<TermCombobox />}
    >
      <ManageTermUsers key={selectedTerm.id} selectedTerm={selectedTerm} />
    </ManagementPage>
  );
}

function ManageTermUsers({ selectedTerm }: { selectedTerm: Term }) {
  const [{ users }, usersApi] = api.staff.getAllUsers.useSuspenseQuery({
    termId: selectedTerm.id,
  });
  const columns = useMemo(
    () => createColumns(selectedTerm.id),
    [selectedTerm.id],
  );

  return (
    <ManagementTableCard
      title="Users"
      description="Manage staff, professors, and access to preference forms."
      actions={<RefetchButton query={usersApi} iconOnly />}
    >
      <DataTable
        variant="management"
        label="Users"
        columns={columns}
        data={users}
        getRowId={(user) => user.id}
        getRowLabel={getUserLabel}
        selectable
        toolbarProps={{
          searchPlaceholder: "Filter users...",
          searchColumnId: "name",
          facetedFilters: [
            {
              columnId: "roles",
              options: Object.values(Role).map((value) => ({
                value,
                label: roleLabels[value],
              })),
            },
            {
              columnId: "hasPreference",
              options: [
                { value: "false", label: "Not submitted" },
                { value: "true", label: "Submitted" },
              ],
            },
            {
              columnId: "locked",
              options: [
                { value: "false", label: "Unlocked" },
                { value: "true", label: "Locked" },
              ],
            },
          ],
        }}
        renderToolbarLeadingActions={(table) => (
          <UserSelectionActions table={table} termId={selectedTerm.id} />
        )}
        renderToolbarActions={() => (
          <UploadAllowedUsersForm termId={selectedTerm.id} />
        )}
      />
    </ManagementTableCard>
  );
}

function UserSelectionActions({
  table,
  termId,
}: {
  table: Table<UserTableRow>;
  termId: string;
}) {
  const utils = api.useUtils();
  const lockAllMutation = api.staff.lockAllStaffPreferences.useMutation({
    onSuccess: async (result) => {
      toast.success(result.message);
      await utils.staff.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const unlockAllMutation = api.staff.unlockAllStaffPreferences.useMutation({
    onSuccess: async (result) => {
      toast.success(result.message);
      await utils.staff.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const userIds = selectedRows.map(({ original }) => original.id);
  const emails = selectedRows
    .map(({ original }) => original.email?.trim())
    .filter(Boolean);
  const isUpdating = lockAllMutation.isPending || unlockAllMutation.isPending;

  if (userIds.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="Selected user actions"
      className="flex items-center gap-2"
    >
      <ButtonGroup aria-label="Preference access">
        <Button
          type="button"
          onClick={() => lockAllMutation.mutate({ termId, userIds })}
          variant="outline"
          size="icon"
          disabled={isUpdating}
          title="Lock selected user preferences"
          aria-label="Lock selected user preferences"
        >
          <Lock aria-hidden="true" />
        </Button>
        <Button
          type="button"
          onClick={() => unlockAllMutation.mutate({ termId, userIds })}
          variant="outline"
          size="icon"
          disabled={isUpdating}
          title="Unlock selected user preferences"
          aria-label="Unlock selected user preferences"
        >
          <Unlock aria-hidden="true" />
        </Button>
      </ButtonGroup>
      <CopyButton
        value={emails.join(", ")}
        showErrorToast
        size="icon"
        variant="outline"
        disabled={emails.length === 0}
        title="Copy selected emails"
        aria-label="Copy selected emails"
      />
    </div>
  );
}
