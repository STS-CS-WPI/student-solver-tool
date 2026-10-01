"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  BaseScheduleSelector,
  dateToSlot,
  slotToDate,
} from "@/lib/schedule-selector";
import { isSlot, type Slot } from "@/lib/schedule-coverage";

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
              <BaseScheduleSelector
                selection={timesRequired.map(slotToDate)}
                onChange={(dates) =>
                  onChange(dates.map(dateToSlot).filter(isSlot))
                }
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
