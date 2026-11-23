import { CheckIcon, ChevronsUpDown, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import type { SectionAccordionProps } from "./section-accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { ScheduleSelector } from "@/components/schedule-selector";
import { stylesByStatus, WEEKDAYS } from "@/lib/schedule-selector";
import { calculateCoverage, slotToKey } from "@/lib/schedule-coverage";

type SectionInfoCardProps = {
  section: SectionAccordionProps["classes"][0];
};

export function SectionInfoCard({ section }: SectionInfoCardProps) {
  const { professor, staff } = section;

  const needed = professor.timesRequired;
  const assigned = staff.flatMap((s) => s.timesAvailable);

  const neededKeys = new Set(needed.map(slotToKey));
  const assignedKeys = new Set(assigned.map(slotToKey));

  const coverageAppearance = {
    default: {
      className: stylesByStatus["not-needed"].cls,
      label: stylesByStatus["not-needed"].title,
    },
    bySlot: Object.fromEntries(
      [...new Set([...neededKeys, ...assignedKeys])].map((key) => {
        const isNeeded = neededKeys.has(key);
        const isAssigned = assignedKeys.has(key);
        const status = isNeeded
          ? isAssigned
            ? "needed-assigned"
            : "needed-unassigned"
          : "not-needed-assigned";
        const { cls, title } = stylesByStatus[status];
        return [key, { className: cls, label: title }];
      }),
    ),
  };
  const { percent, totalCovered, totalNeeded } = calculateCoverage(
    needed,
    assigned,
  );

  return (
    <Card className="flex-2">
      <CardHeader>
        <CardTitle>Section Info</CardTitle>
      </CardHeader>

      <CardContent className="gap-1 text-sm">
        <div>
          <p>
            <span className="font-medium">Instructor: </span>
            {professor?.name ?? "TBD"}
          </p>
          <p>
            <span className="font-medium">Email: </span>
            {professor?.email ?? "TBD"}
          </p>
          <p>
            <span className="font-medium">Comments: </span>
            {professor?.comments ?? "N/A"}
          </p>
        </div>
        <p>
          <span className="font-medium">Enrollment: </span>
          {section.enrollment}/{section.capacity}
        </p>

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Professor required times</span>
              <ChevronsUpDown className="h-4 w-4" aria-hidden="true" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-1">
            <div className="flex flex-col space-y-1 overflow-x-auto rounded-md border p-2">
              <ScheduleSelector
                className="mx-auto max-w-lg [--schedule-hour-height:24px]"
                weekdays={WEEKDAYS}
                startHour={8}
                endHour={22}
                resolution={60}
                appearance={coverageAppearance}
              />
              <section>
                <div className="text-muted-foreground">
                  Coverage: <strong>{percent}%</strong> ({totalCovered}/
                  {totalNeeded} hrs)
                </div>
                <div className="text-muted-foreground">
                  Meeting pattern: {section.meetingPattern}
                </div>
              </section>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>Professor Preferences</span>
              <ChevronsUpDown className="h-4 w-4" aria-hidden="true" />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-1">
            <div className="overflow-x-auto rounded-md border">
              {/* TODO: add button to quickly add preferred staff to section */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!professor?.preferredStaff?.length &&
                  !professor?.avoidedStaff?.length ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-muted-foreground h-10 text-center"
                      >
                        No staff preferences yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {professor?.preferredStaff?.map((s) => (
                        <TableRow
                          key={s.id}
                          title="This staff is a preference of this professor"
                        >
                          <TableCell className="flex items-center gap-2 font-medium">
                            <Badge variant="success" className="px-1">
                              <CheckIcon className="size-4" />
                            </Badge>
                            {s.name}
                          </TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell>{s.roles.join(", ")}</TableCell>
                        </TableRow>
                      ))}
                      {professor?.avoidedStaff?.map((s) => (
                        <TableRow
                          key={s.id}
                          title="This staff is an anti-preference of this professor"
                        >
                          <TableCell className="flex items-center gap-2 font-medium">
                            <Badge variant="destructive" className="px-1">
                              <XIcon className="size-4" />
                            </Badge>
                            {s.name}
                          </TableCell>
                          <TableCell>{s.email}</TableCell>
                          <TableCell>{s.roles.join(", ")}</TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
