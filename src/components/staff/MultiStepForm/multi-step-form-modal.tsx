"use client";
import { useState } from "react";
import { slotToDate } from "@/lib/schedule-selector";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FormEntryAvailability from "./form-entry-availability";
import FormEntryTimes from "./form-entry-times";
import ProgressIndicator from "./progress-indicator";
import FormEntryQualifications from "./form-entry-qualifications";
import FormEntryPreferences from "./form-entry-preferences";
import FormEntryComments from "./form-entry-comments";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Route } from "next";

interface MultiStepFormModalProps {
  onClose?: () => void;
  /** If true, render inline (no fixed overlay) so the form can be used as a full page */
  inline?: boolean;
  redirectOnComplete?: Route;
  /** Required: user ID of the authenticated user */
  userId: string;
  termId: string;
}

const MultiStepFormModal: React.FC<MultiStepFormModalProps> = ({
  onClose,
  inline = false,
  redirectOnComplete,
  userId,
  termId,
}) => {
  // Data collected from each step, initialized from database
  const [qualifiedSections, setQualifiedSectionIds] = useState<string[]>([]);
  const router = useRouter();
  const isMobile = useIsMobile();

  const [{ term }] = api.studentDashboard.getTermInfo.useSuspenseQuery({
    termId,
  });
  const [{ canEdit }] = api.studentForm.getCanEdit.useSuspenseQuery({
    userId,
  });

  // fetch sections for the selected term and pass to qualifications UI
  const [{ sections }] = api.studentForm.getSections.useSuspenseQuery({
    termId,
  });

  // fetch previously saved preferences for the students saved answers before showing the form
  const utils = api.useUtils();
  const { data: savedForm, isLoading: isLoadingSavedForm } =
    api.studentDashboard.getPreferencesFormData.useQuery({ userId, termId });

  // state to control interface
  const [mode, setMode] = useState<"choose" | "editing">("choose");
  // confirm before deleting saved answers when creating new form
  const [confirmReset, setConfirmReset] = useState(false);
  // call to server to delete esisting form and clear local answers only on success
  const resetMutation = api.studentForm.resetStudentForm.useMutation({
    onSuccess: async () => {
      await utils.studentDashboard.invalidate();
      setQualifiedSectionIds([]);
      setCurrentTimes([]);
      setCurrentPrefs({});
      setCurrentComments("");
      setStep(1);
      setConfirmReset(false);
      setMode("editing");
      toast.success("Previous preferences deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  // restore persisted answers into formats expected for each step in form
  const continueEditing = () => {
    if (!savedForm) return;
    setQualifiedSectionIds(savedForm.qualifications.map((q) => q.sectionId));
    setCurrentTimes(savedForm.timesAvailable.map(slotToDate));
    setCurrentPrefs(
      Object.fromEntries(
        savedForm.preferences.map((p) => [
          p.sectionId,
          p.rank === "STRONGLY_PREFER" ? "strong" : "prefer",
        ]),
      ) as Record<string, "prefer" | "strong">,
    );
    setCurrentComments(savedForm.comments ?? "");
    setStep(1);
    setMode("editing");
  };

  const [step, setStep] = useState(1);

  const [currentTimes, setCurrentTimes] = useState<Date[]>([]);
  const [currentPrefs, setCurrentPrefs] = useState({});
  const [currentComments, setCurrentComments] = useState("");

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = () => {
    if (redirectOnComplete) router.push(redirectOnComplete);
    onClose?.();
  };

  const cantEditContainer = (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">
        Preferences Form is closed for {term.termLetter} Term {term.year}
      </h1>
      <p className="text-muted-foreground mt-2">
        The coordinator has locked the form, and edits cannot be made at this
        time.
      </p>
    </div>
  );

  if (!canEdit?.canEditForm) {
    if (inline) return cantEditContainer;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="border-foreground bg-background h-[600px] w-[90vw] max-w-2xl overflow-y-auto rounded-2xl border p-10 shadow-lg">
          {cantEditContainer}
        </div>
      </div>
    );
  }

  // display either loading message, choice screen, or original form
  const container = (
    <div className="h-auto w-full overflow-y-auto rounded-2xl p-6">
      {isLoadingSavedForm ? (
        <p>Loading saved preferences...</p>
      ) : mode === "choose" && savedForm ? (
        <div className="mx-auto max-w-lg space-y-4">
          <h2 className="text-xl font-semibold">Existing preferences found</h2>
          <p>
            Continue editing your saved form or permanently delete it and start
            again.
          </p>
          <Button onClick={continueEditing}>Continue Editing</Button>
          {!confirmReset ? (
            <Button variant="outline" onClick={() => setConfirmReset(true)}>
              Start New Form
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border p-4" role="alert">
              <p>
                Delete all saved preferences for this term? This cannot be
                undone.
              </p>
              <Button
                variant="destructive"
                disabled={resetMutation.isPending}
                onClick={() => resetMutation.mutate({ userId, termId })}
              >
                {resetMutation.isPending
                  ? "Deleting..."
                  : "Confirm Delete and Start New"}
              </Button>
              <Button
                variant="outline"
                disabled={resetMutation.isPending}
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {!isMobile && <ProgressIndicator step={step} totalSteps={5} />}
          {step === 1 && (
            // doesnt need initial data, can always start form with available/not
            <FormEntryAvailability
              userId={userId}
              termId={termId}
              onNext={handleNext}
              onExit={handleSubmit}
            />
          )}
          {step === 2 && (
            //TODO pass in initial times data
            <FormEntryTimes
              userId={userId}
              termId={termId}
              prevData={currentTimes}
              onChange={(times) => setCurrentTimes(times)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 3 && (
            <FormEntryQualifications
              userId={userId}
              termId={termId}
              courses={sections}
              onChange={(ids) => setQualifiedSectionIds(ids)}
              prevData={qualifiedSections}
              onNext={handleNext}
              onBack={handleBack}
              onSubmit={handleSubmit}
            />
          )}
          {step === 4 && (
            //TODO pass in initial prefs
            <FormEntryPreferences
              userId={userId}
              termId={termId}
              courses={sections}
              selectedSectionIds={qualifiedSections}
              prevData={currentPrefs}
              onChange={(prefs) => setCurrentPrefs(prefs)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {step === 5 && (
            //TODO pass in initial comments
            <FormEntryComments
              userId={userId}
              termId={termId}
              prevData={currentComments}
              onChange={(comments) => setCurrentComments(comments)}
              onSubmit={handleSubmit}
              onBack={handleBack}
            />
          )}
        </>
      )}
    </div>
  );

  if (inline) {
    return container;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="border-foreground bg-background h-[600px] w-[90vw] max-w-2xl overflow-y-auto rounded-2xl border p-10 shadow-lg">
        {container}
      </div>
    </div>
  );
};

export default MultiStepFormModal;
