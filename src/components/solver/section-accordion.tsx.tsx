import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionSolverHourCoverage } from "./section-solver-hour-coverage";
import { type RouterInputs, type RouterOutputs } from "@/trpc/react";
import { normalize, toFullCourseName } from "@/lib/utils";
import { SectionInfoCard } from "./section-info-card";
import { AssignedAssistantsCard } from "./assigned-assistant-card";
import { SectionSolverScheduleCoverage } from "./section-solver-schedule-coverage";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { useMemo, useState } from "react";
import { XIcon } from "lucide-react";

export type SectionAccordionProps = {
  selected: string | undefined;
  onSelectedChange: (val: string) => void;
  onUnassign: (input: RouterInputs["assignment"]["remove"]) => void;
  onToggleAssignmentLock: (
    input: RouterInputs["assignment"]["toggleAssignmentLock"],
  ) => void;
  classes: RouterOutputs["courses"]["getAllCoursesForTerm"]["courses"];
};

// TODO: add filters
// sorting by scheduling percent coverage, assigned hours etc
export function SectionAccordion({
  classes,
  onSelectedChange,
  onUnassign,
  onToggleAssignmentLock,
  selected,
}: SectionAccordionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // when searching, only show sections that have a matching person assigned
  const filteredClasses = useMemo(() => {
    const tokens = normalize(searchTerm).trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return classes;

    return classes.filter((section) =>
      section.staff.some((s) => {
        const name = normalize(s.name ?? "");
        const email = normalize(s.email ?? "");
        return tokens.every((t) => name.includes(t) || email.includes(t));
      }),
    );
  }, [classes, searchTerm]);

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-2">
        <div className="relative">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="search"
            placeholder="Search assigned staff..."
            className="pr-8"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-muted-foreground p-1 text-sm">
            {filteredClasses.length} of {classes.length} sections
          </p>
        )}
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          value={selected}
          onValueChange={onSelectedChange}
        >
          {filteredClasses.map((section) => (
            <AccordionItem value={section.id} key={section.id} className="px-4">
              <AccordionTrigger className="items-center gap-2 text-xl">
                <span className="min-w-0 flex-1">
                  {toFullCourseName(
                    section.courseCode,
                    section.courseSection,
                    section.title,
                  )}
                </span>
                <div className="flex shrink-0 space-x-2">
                  <SectionSolverScheduleCoverage
                    needed={section.professor.timesRequired}
                    assigned={section.staff.flatMap((s) => s.timesAvailable)}
                  />
                  <SectionSolverHourCoverage
                    marginOfError={10} // TODO: not hardcode this
                    hoursRequired={section.requiredHours}
                    hoursAssigned={section.staff.reduce(
                      (accumulator, currVal) =>
                        accumulator + (currVal.hours ?? 0),
                      0,
                    )}
                  />
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex space-x-4 text-balance [&_p:not(:last-child)]:mb-0!">
                <SectionInfoCard section={section} />
                <AssignedAssistantsCard
                  section={section}
                  onUnassign={onUnassign}
                  onToggleAssignmentLock={onToggleAssignmentLock}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {searchTerm && filteredClasses.length === 0 && (
          <p className="text-muted-foreground p-4 text-center text-sm">
            No sections have a matching person assigned.
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
