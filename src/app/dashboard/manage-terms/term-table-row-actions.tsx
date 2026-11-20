"use client";
import {
  CalendarIcon,
  LockIcon,
  PlusIcon,
  PowerIcon,
  PowerOffIcon,
  Trash2Icon,
  UnlockIcon,
} from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UploadAllowedUsersForm } from "@/components/dashboard/upload-allowed-users-form";
import { SyncSectionsForm } from "@/components/dashboard/sync-sections-form";
import type { TermRow } from "./columns";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Confirm } from "@/components/confirm-action-wrapper";
import {
  RowActionsMenu,
  useRowActionsMenu,
} from "@/components/data-table/row-actions-menu";

export function TermTableRowActions({ term }: { term: TermRow }) {
  const rowMenu = useRowActionsMenu<"users" | "sections" | "delete">();
  const utils = api.useUtils();

  const deleteTerm = api.term.deleteTerm.useMutation({
    onSuccess: async () => {
      toast.success("Term deleted.");
      await utils.term.getTermStats.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
    },
    onSettled: async () => {
      await utils.term.invalidate();
    },
  });

  const publishTerm = api.term.publishTerm.useMutation({
    onSuccess: async () => {
      toast.success("Term published.");
      await Promise.all([
        utils.dashboard.invalidate(),
        utils.term.getTermStats.invalidate(),
        utils.term.getAllTerms.invalidate(),
        utils.term.invalidate(),
      ]);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const lockAll = api.staff.lockAllStaffPreferences.useMutation({
    onSuccess: async (result) => {
      toast.success(result.message);
      await utils.staff.getAllUsers.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const unlockAll = api.staff.unlockAllStaffPreferences.useMutation({
    onSuccess: async (result) => {
      toast.success(result.message);
      await utils.staff.getAllUsers.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const activateTerm = api.term.activateTerm.useMutation({
    onSuccess: async () => {
      await utils.term.getTermStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
    onSettled: async () => await utils.term.invalidate(),
  });

  const deactivateTerm = api.term.deactivateTerm.useMutation({
    onSuccess: async () => {
      await utils.term.getTermStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
    onSettled: async () => await utils.term.invalidate(),
  });

  return (
    <>
      <RowActionsMenu label={`Actions for ${term.name}`} {...rowMenu.menuProps}>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => rowMenu.openDialog("users")}>
          <PlusIcon aria-hidden="true" />
          Upload users
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => rowMenu.openDialog("sections")}>
          <PlusIcon aria-hidden="true" />
          Add section(s)
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          onClick={() => publishTerm.mutate({ id: term.id })}
          disabled={publishTerm.isPending}
        >
          <CalendarIcon aria-hidden="true" />
          Publish term
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          onClick={() => lockAll.mutate({ termId: term.id })}
          disabled={lockAll.isPending}
        >
          <LockIcon aria-hidden="true" />
          Lock all
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          onClick={() => unlockAll.mutate({ termId: term.id })}
          disabled={unlockAll.isPending}
        >
          <UnlockIcon aria-hidden="true" />
          Unlock all
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          onClick={() =>
            term.active
              ? deactivateTerm.mutate({ id: term.id })
              : activateTerm.mutate({ id: term.id })
          }
        >
          {term.active ? (
            <PowerOffIcon aria-hidden="true" />
          ) : (
            <PowerIcon aria-hidden="true" />
          )}
          {term.active ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => rowMenu.openDialog("delete")}
          disabled={deleteTerm.isPending}
          variant="destructive"
        >
          <Trash2Icon aria-hidden="true" />
          Delete
        </DropdownMenuItem>
      </RowActionsMenu>
      <UploadAllowedUsersForm
        termId={term.id}
        {...rowMenu.getDialogProps("users")}
        {...rowMenu.dialogContentProps}
      >
        {null}
      </UploadAllowedUsersForm>
      <SyncSectionsForm
        year={term.year}
        termLetter={term.termLetter}
        {...rowMenu.getDialogProps("sections")}
        {...rowMenu.dialogContentProps}
      >
        {null}
      </SyncSectionsForm>
      <Confirm
        {...rowMenu.getDialogProps("delete")}
        {...rowMenu.dialogContentProps}
        title="Delete term?"
        confirmLabel="Delete"
        confirmVariant="destructive"
        action={() => deleteTerm.mutate({ id: term.id })}
      />
    </>
  );
}
