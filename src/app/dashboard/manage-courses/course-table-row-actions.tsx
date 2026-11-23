"use client";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type z from "zod";
import type { CourseRow } from "./columns";
import type { SectionItemSchema } from "@/lib/courselisting-api";
import { SingleSectionForm } from "@/components/dashboard/single-section-form";
import { Confirm } from "@/components/confirm-action-wrapper";
import {
  RowActionsMenu,
  useRowActionsMenu,
} from "@/components/data-table/row-actions-menu";

export function CourseTableRowAction({ course }: { course: CourseRow }) {
  const rowMenu = useRowActionsMenu<"edit" | "delete">();
  const utils = api.useUtils();
  const [professors] = api.user.getAllProfessors.useSuspenseQuery();
  const deleteCourseMutation = api.courses.deleteCourse.useMutation({
    onSuccess: async () => {
      toast.success("Course deleted successfully!");
      await utils.courses.getAllCourses.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateCourseMutation = api.courses.updateCourse.useMutation({
    onSuccess: async () => {
      toast.success("Course updated successfully!");
      await utils.courses.getAllCourses.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function handleDelete() {
    deleteCourseMutation.mutate({ id: course.id });
  }

  function onEdit(data: z.infer<typeof SectionItemSchema>) {
    updateCourseMutation.mutate({ id: course.id, data });
  }

  return (
    <>
      <RowActionsMenu
        label={`Actions for ${course.courseCode}-${course.courseSection}`}
        {...rowMenu.menuProps}
      >
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => rowMenu.openDialog("edit")}>
          <Edit className="h-4 w-4" /> Edit course
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => rowMenu.openDialog("delete")}
          disabled={deleteCourseMutation.isPending}
        >
          <Trash2 className="h-4 w-4" /> Delete
        </DropdownMenuItem>
      </RowActionsMenu>
      <Dialog {...rowMenu.getDialogProps("edit")}>
        <DialogContent className="sm:max-w-6xl" {...rowMenu.dialogContentProps}>
          <DialogHeader>
            <DialogTitle>Edit course</DialogTitle>
            <DialogDescription>All fields are required</DialogDescription>
          </DialogHeader>
          <SingleSectionForm
            onSubmit={onEdit}
            professors={professors}
            defaultValues={{
              ...course,
              professorName: course.professorName,
              professorId: course.professorId,
            }}
          />
        </DialogContent>
      </Dialog>
      <Confirm
        {...rowMenu.getDialogProps("delete")}
        {...rowMenu.dialogContentProps}
        action={handleDelete}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}
