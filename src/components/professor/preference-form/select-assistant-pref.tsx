"use client";

import React, { useId, useMemo } from "react";

import { RoleBadges } from "@/components/role-badge";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import type { User } from "next-auth";

type SelectAssistantPreferenceProps = {
  title: string;
  description: string;
  sectionId: string;
  availableAssistants: User[];
  selectedStaff: User[];
  onChange: (selectedStaff: User[]) => void;
};

export const SelectAssistantPref: React.FC<SelectAssistantPreferenceProps> = ({
  title,
  description,
  sectionId,
  availableAssistants,
  selectedStaff,
  onChange,
}) => {
  const inputId = useId();
  const descriptionId = useId();

  const byId = useMemo(() => {
    const m = new Map<string, User>();
    for (const a of availableAssistants) m.set(a.id, a);
    return m;
  }, [availableAssistants]);

  const selectedIds = useMemo(
    () => selectedStaff.map((a) => a.id),
    [selectedStaff],
  );
  return (
    <Field className="py-3.5">
      <FieldLabel htmlFor={inputId}>{title}</FieldLabel>
      <FieldDescription id={descriptionId}>{description}</FieldDescription>
      <Combobox
        items={availableAssistants}
        multiple
        value={selectedIds}
        onValueChange={(next) => {
          const ids = Array.isArray(next) ? next : next ? [next] : [];
          const staff = ids
            .map((id) => byId.get(id))
            .filter((user): user is User => user != undefined);
          onChange(staff);
        }}
      >
        <ComboboxChips>
          <ComboboxValue>
            {selectedIds.map((id) => (
              <ComboboxChip key={`${sectionId}-${id}`}>
                {byId.get(id)?.name ?? id}
              </ComboboxChip>
            ))}
          </ComboboxValue>
          <ComboboxChipsInput
            id={inputId}
            aria-describedby={descriptionId}
            className="text-base"
            placeholder="Select staff..."
          />
        </ComboboxChips>
        <ComboboxContent className="min-w-[250px]">
          <ComboboxEmpty>No staff found.</ComboboxEmpty>
          <ComboboxList>
            {(assistant: User) => (
              <ComboboxItem
                key={`${sectionId}-${assistant.id}`}
                value={assistant.id}
              >
                <Item size="sm" className="p-0">
                  <ItemContent>
                    <ItemTitle className="whitespace-nowrap">
                      {assistant.name}{" "}
                      <RoleBadges roles={assistant.roles ?? []} />
                    </ItemTitle>
                    <ItemDescription>{assistant.email}</ItemDescription>
                  </ItemContent>
                </Item>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  );
};
