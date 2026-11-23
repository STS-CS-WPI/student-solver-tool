"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScheduleSelector } from "@/components/schedule-selector";
import { WEEKDAYS } from "@/lib/schedule-selector";
import type { Slot } from "@/lib/schedule-coverage";

type SelectRequiredTimesProps = {
  timesRequired: Slot[];
  onChange: (slot: Slot[]) => void;
};

export const SelectRequiredTimes: React.FC<SelectRequiredTimesProps> = ({
  timesRequired,
  onChange,
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={timesRequired.length > 0 ? "required-times" : undefined}
    >
      <AccordionItem value="required-times">
        <AccordionTrigger type="button">
          In-person help needed?
        </AccordionTrigger>
        <AccordionContent className="[&_p:not(:last-child)]:mb-0">
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              Request only the times you absolutely need. Requesting many slots
              may lead to poor assignments. Leave empty if you don&apos;t need
              in-person help.
            </p>
            <div className="mx-auto w-full max-w-3xl">
              <ScheduleSelector
                className="mx-auto max-w-lg [--schedule-hour-height:24px]"
                weekdays={WEEKDAYS}
                startHour={8}
                endHour={22}
                resolution={60}
                selection={timesRequired}
                onChange={onChange}
              />
            </div>
            {timesRequired.length > 0 && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange([])}
                >
                  Clear requested times
                </Button>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
