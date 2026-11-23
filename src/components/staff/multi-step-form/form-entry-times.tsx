"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { ScheduleSelector } from "@/components/schedule-selector";
import { WEEKDAYS } from "@/lib/schedule-selector";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { dedupe, type Slot } from "@/lib/schedule-coverage";

interface FormEntryTimesProps {
  userId: string;
  termId: string;
  prevData: Slot[];
  onChange: (selection: Slot[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const FormEntryTimes: React.FC<FormEntryTimesProps> = ({
  userId,
  termId,
  prevData,
  onChange,
  onNext,
  onBack,
}) => {
  const [selection, setSelection] = useState<Slot[]>(prevData);
  const utils = api.useUtils();
  const saveFormMutation = api.studentForm.saveStudentForm.useMutation({
    onError: (error) => {
      toast.error("Failed to save available times", {
        description: error.message,
      });
      console.error("Failed to save form:", error);
    },
    onSuccess: () => {
      toast.success("Form saved successfully");
      void utils.studentDashboard.invalidate();
      onChange(selection);
      onNext();
    },
  });

  function handleNextClick() {
    saveFormMutation.mutate({
      userId,
      termId,
      weeklyAvailability: dedupe(selection),
    });
  }

  function handleBackClick() {
    onChange(selection);
    onBack();
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h2 className="mb-4 text-xl font-semibold">
        Select the times you are available for in-person, on campus work this
        term
      </h2>

      <div className="border-secondary rounded-lg border p-4 shadow-sm">
        <ScheduleSelector
          className="mx-auto max-w-lg [--schedule-hour-height:24px]"
          weekdays={WEEKDAYS}
          startHour={8}
          endHour={22}
          resolution={60}
          selection={selection}
          onChange={setSelection}
        />
      </div>

      <div className="mt-4 flex justify-between">
        <Button
          onClick={handleBackClick}
          variant="outline"
          disabled={saveFormMutation.isPending}
        >
          Back
        </Button>
        <Button onClick={handleNextClick} disabled={saveFormMutation.isPending}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default FormEntryTimes;
