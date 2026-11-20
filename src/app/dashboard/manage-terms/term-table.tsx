"use client";

import { useMemo } from "react";
import { ManagementTableCard } from "@/components/dashboard/management-layout";
import { DataTable } from "@/components/data-table";
import { RefetchButton } from "@/components/refetch-button";
import { api } from "@/trpc/react";
import { createColumns, type TermRow } from "./columns";
import { CreateTermDialogForm } from "./create-term-form";

const getTermLabel = (term: TermRow) => term.name;

export function TermTable() {
  const [termStats, termsApi] = api.term.getTermStats.useSuspenseQuery();
  const columns = useMemo(createColumns, []);
  const rows = useMemo<TermRow[]>(
    () =>
      termStats.map((term) => ({
        ...term,
        name: `${term.termLetter} ${term.year}`,
      })),
    [termStats],
  );

  return (
    <ManagementTableCard
      title="Terms"
      description="View term participation, deadlines, and activation status."
      actions={<RefetchButton query={termsApi} iconOnly />}
    >
      <DataTable
        variant="management"
        label="Terms"
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        getRowLabel={getTermLabel}
        selectable
        toolbarProps={{
          searchColumnId: "name",
          searchPlaceholder: "Filter terms...",
          facetedFilters: [
            {
              columnId: "active",
              options: [
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ],
            },
          ],
        }}
        renderToolbarActions={() => <CreateTermDialogForm />}
      />
    </ManagementTableCard>
  );
}
