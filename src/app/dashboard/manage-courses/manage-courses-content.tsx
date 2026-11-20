"use client";

import { useMemo } from "react";
import { AcademicLevel } from "@prisma/client";
import {
  ManagementPage,
  ManagementTableCard,
} from "@/components/dashboard/management-layout";
import { NoTermsAlert } from "@/components/dashboard/no-term-alert";
import { SyncSectionsForm } from "@/components/dashboard/sync-sections-form";
import { DataTable } from "@/components/data-table";
import { RefetchButton } from "@/components/refetch-button";
import { TermCombobox, useTerm, type Term } from "@/components/term-combobox";
import { humanizeKey } from "@/lib/utils";
import { api } from "@/trpc/react";
import { createColumns, getCourseLabel } from "./columns";

export default function ManageCoursesContent() {
  const { selectedTerm } = useTerm();

  if (!selectedTerm) return <NoTermsAlert />;

  return (
    <ManagementPage
      title="Manage Courses"
      description={`Managing courses for ${selectedTerm.label} term`}
      actions={<TermCombobox />}
    >
      <ManageTermCourses key={selectedTerm.id} selectedTerm={selectedTerm} />
    </ManagementPage>
  );
}

function ManageTermCourses({ selectedTerm }: { selectedTerm: Term }) {
  const [{ courses }, courseApi] = api.courses.getAllCourses.useSuspenseQuery({
    termId: selectedTerm.id,
  });
  const columns = useMemo(createColumns, []);

  return (
    <ManagementTableCard
      title="Courses"
      description="Add, edit, and remove courses for the selected term."
      actions={<RefetchButton query={courseApi} iconOnly />}
    >
      <DataTable
        variant="management"
        label="Courses"
        columns={columns}
        data={courses}
        getRowId={(course) => course.id}
        getRowLabel={getCourseLabel}
        selectable
        toolbarProps={{
          searchPlaceholder: "Filter courses...",
          searchColumnId: "courseTitle",
          facetedFilters: [
            {
              columnId: "professorName",
              label: "Professor assignment",
              options: [
                { label: "Has professor", value: "assigned" },
                { label: "No professor", value: "unassigned" },
              ],
            },
            {
              columnId: "academicLevel",
              options: Object.values(AcademicLevel).map((value) => ({
                value,
                label: humanizeKey(value),
              })),
            },
          ],
        }}
        renderToolbarActions={() => <SyncSectionsForm {...selectedTerm} />}
      />
    </ManagementTableCard>
  );
}
