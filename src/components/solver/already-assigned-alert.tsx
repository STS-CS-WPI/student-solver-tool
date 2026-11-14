import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

export type AlreadyAssignedAlertProps = {
  staffName: string;
  fromCourse: string;
  toCourse: string;
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
  onDontShowAgainChange: (checked: boolean) => void;
};
export function AlreadyAssignedAlert({
  toCourse,
  fromCourse,
  staffName,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  onDontShowAgainChange,
}: AlreadyAssignedAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {staffName} is already assigned to {fromCourse}. Continuing will
            remove them from {fromCourse} and assign them to {toCourse}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center gap-3">
          <Checkbox
            id="showagain"
            onCheckedChange={(checked) =>
              onDontShowAgainChange(checked === true)
            }
          />
          <Label htmlFor="showagain">Don&apos;t show this warning again</Label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
