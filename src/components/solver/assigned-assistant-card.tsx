import type { RouterInputs } from "@/trpc/react";
import type { SectionAccordionProps } from "./section-accordion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Droppable } from "../droppable";
import { Toggle } from "../ui/toggle";
import { LockIcon, UnlockIcon, XIcon } from "lucide-react";
import { Draggable } from "../draggable";
import { StaffItem } from "./staff-item";
import { Button } from "../ui/button";
import { getSectionPreference } from "./staff-selection-sidebar";
import { StaffWarnings } from "./staff-warnings";

export function AssignedAssistantsCard({
  section,
  onToggleAssignmentLock,
  onUnassign,
}: {
  section: SectionAccordionProps["classes"][0];
  onToggleAssignmentLock: (
    input: RouterInputs["assignment"]["toggleAssignmentLock"],
  ) => void;
  onUnassign: (input: RouterInputs["assignment"]["remove"]) => void;
}) {
  const sectionCode = `${section.courseCode}-${section.courseSection}`;

  return (
    <Card className="flex-5">
      <CardHeader>
        <CardTitle>Assigned Assistants</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <Droppable
          id={section.id}
          className="h-full"
          data={{
            action: "assign",
            code: sectionCode,
          }}
        >
          <ul className="space-y-2">
            {section.staff.map((staff) => (
              <li
                key={staff.id}
                className="flex flex-row items-center space-x-2"
              >
                <Toggle
                  variant="outline"
                  aria-label={`Lock assignment for ${staff.name} to ${sectionCode}`}
                  title={`Lock/unlock ${staff.name} to ${sectionCode}`}
                  pressed={staff.locked}
                  onPressedChange={() =>
                    onToggleAssignmentLock({
                      sectionId: section.id,
                      staffId: staff.id,
                    })
                  }
                >
                  {staff.locked ? <LockIcon /> : <UnlockIcon />}
                </Toggle>
                <Draggable id={staff.id} data={{ staff }} className="flex-1">
                  <StaffItem
                    {...staff}
                    rank={getSectionPreference(staff, section.id)}
                  >
                    <StaffWarnings flags={staff.flags} />
                  </StaffItem>
                </Draggable>
                <Button
                  size="icon"
                  variant="destructive"
                  aria-label={`Unassign ${staff.name} from ${sectionCode}`}
                  title={`Unassign ${staff.name} from ${sectionCode}`}
                  onClick={() =>
                    onUnassign({
                      sectionId: section.id,
                      staffId: staff.id,
                    })
                  }
                >
                  <XIcon />
                </Button>
              </li>
            ))}
          </ul>
        </Droppable>
      </CardContent>
    </Card>
  );
}
