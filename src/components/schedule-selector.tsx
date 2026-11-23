"use client";

import type { Day } from "@prisma/client";
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { cn } from "@/lib/utils";
import { slotToKey, type Slot } from "@/lib/schedule-coverage";

const weekdayNames: Record<Day, string> = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  R: "Thursday",
  F: "Friday",
};

type ScheduleSlotMap<T> = Readonly<Partial<Record<string, T>>>;
type ScheduleResolution = 15 | 30 | 60;

export interface ScheduleCellAppearance {
  className?: string;
  style?: CSSProperties;
  label: string;
}

export interface ScheduleSelectorProps {
  weekdays: readonly Day[];
  startHour: number;
  endHour: number;
  resolution: ScheduleResolution;
  className?: string;
  ariaLabel?: string;
  selection?: readonly Slot[];
  onChange?: (selection: Slot[]) => void;
  appearance?: {
    bySlot: ScheduleSlotMap<ScheduleCellAppearance>;
    default: ScheduleCellAppearance;
    onInspectSlot?: (slot: Slot | null) => void;
  };
}

type Drag = { pointerId: number; start: number; end: number; select: boolean };

const hourFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  hour: "numeric",
  hour12: true,
});
const minuteFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function formatTime(minute: number, includeMinutes: boolean) {
  return (includeMinutes ? minuteFormatter : hourFormatter).format(
    minute * 60_000,
  );
}

function createRows({
  weekdays,
  startMinute,
  endMinute,
  resolution,
}: {
  weekdays: readonly Day[];
  startMinute: number;
  endMinute: number;
  resolution: ScheduleResolution;
}) {
  return Array.from(
    { length: (endMinute - startMinute) / resolution },
    (_, row) => {
      const minute = startMinute + row * resolution;
      return {
        hourLabel:
          minute % 60 === 0 || row === 0
            ? formatTime(minute, minute % 60 !== 0)
            : null,
        cells: weekdays.map((day) => {
          const slot = { day, hour: minute / 60 };
          return {
            slot,
            key: slotToKey(slot),
            label: `${weekdayNames[day]}, ${formatTime(minute, true)} to ${formatTime(minute + resolution, true)}`,
          };
        }),
      };
    },
  );
}

function inRectangle(
  index: number,
  start: number,
  end: number,
  columnCount: number,
) {
  const row = Math.floor(index / columnCount);
  const column = index % columnCount;
  const startRow = Math.floor(start / columnCount);
  const endRow = Math.floor(end / columnCount);
  const startColumn = start % columnCount;
  const endColumn = end % columnCount;

  return (
    row >= Math.min(startRow, endRow) &&
    row <= Math.max(startRow, endRow) &&
    column >= Math.min(startColumn, endColumn) &&
    column <= Math.max(startColumn, endColumn)
  );
}

export function ScheduleSelector(props: ScheduleSelectorProps) {
  const { weekdays, startHour, endHour, resolution } = props;
  const startMinute = startHour * 60;
  const endMinute = endHour * 60;
  if (resolution !== 15 && resolution !== 30 && resolution !== 60) {
    throw new RangeError("Schedule resolution must be 15, 30, or 60 minutes.");
  }
  if (
    !Number.isSafeInteger(startMinute) ||
    !Number.isSafeInteger(endMinute) ||
    startMinute < 0 ||
    endMinute > 1440 ||
    startMinute >= endMinute ||
    startMinute % resolution !== 0 ||
    endMinute % resolution !== 0
  ) {
    throw new RangeError(
      "Schedule bounds must fall on display-slot boundaries within one day.",
    );
  }
  if (new Set(weekdays).size !== weekdays.length) {
    throw new RangeError("Schedule weekdays must be unique.");
  }
  if (weekdays.length === 0) return null;

  return (
    <ScheduleGrid
      key={JSON.stringify([weekdays, startMinute, endMinute, resolution])}
      {...props}
    />
  );
}

function ScheduleGrid({
  weekdays,
  startHour,
  endHour,
  resolution,
  className,
  ariaLabel,
  selection = [],
  onChange,
  appearance,
}: ScheduleSelectorProps) {
  const startMinute = startHour * 60;
  const endMinute = endHour * 60;
  const { rows, cells, closingLabel } = useMemo(() => {
    const rows = createRows({
      weekdays,
      startMinute,
      endMinute,
      resolution,
    });
    return {
      rows,
      cells: rows.flatMap((row) => row.cells),
      closingLabel: formatTime(endMinute, endMinute % 60 !== 0),
    };
  }, [weekdays, startMinute, endMinute, resolution]);
  const columnCount = weekdays.length;
  const [focusedSlot, setFocusedSlot] = useState(0);
  const [preview, setPreview] = useState<Drag | null>(null);
  const drag = useRef<Drag | null>(null);
  const onInspectSlot = onChange ? undefined : appearance?.onInspectSlot;
  const canInspect = onInspectSlot !== undefined;
  const inspectCallback = useRef(onInspectSlot);
  const inspection = useRef<{
    pointer: number | null;
    focus: number | null;
    active: number | null;
  }>({ pointer: null, focus: null, active: null });

  useLayoutEffect(() => {
    inspectCallback.current = onInspectSlot;
  });

  useLayoutEffect(() => {
    if (!canInspect) return;

    return () => {
      const hadActiveSlot = inspection.current.active !== null;
      inspection.current = { pointer: null, focus: null, active: null };
      if (hadActiveSlot) inspectCallback.current?.(null);
    };
  }, [canInspect]);

  const selected = new Map(selection.map((slot) => [slotToKey(slot), slot]));

  function commit(start: number, end: number, select: boolean) {
    cells.forEach(({ slot, key }, index) => {
      if (!inRectangle(index, start, end, columnCount)) return;

      if (select) selected.set(key, { ...slot });
      else selected.delete(key);
    });
    onChange?.([...selected.values()]);
  }

  function slotAt(target: EventTarget | null, grid: HTMLElement) {
    const cell =
      target instanceof Element
        ? target.closest<HTMLElement>("[data-slot]")
        : null;
    return cell && grid.contains(cell) ? Number(cell.dataset.slot) : null;
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!onChange || !event.isPrimary || event.button !== 0 || drag.current)
      return;

    const grid = event.currentTarget;
    const index = slotAt(event.target, grid);
    const cell = index === null ? undefined : cells[index];
    if (index === null || !cell) return;

    event.preventDefault();
    const active = document.activeElement;
    if (active instanceof HTMLButtonElement && grid.contains(active))
      active.blur();
    setFocusedSlot(index);

    const next = {
      pointerId: event.pointerId,
      start: index,
      end: index,
      select: !selected.has(cell.key),
    };
    drag.current = next;
    setPreview(next);
    grid.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;

    const end = slotAt(
      document.elementFromPoint(event.clientX, event.clientY),
      event.currentTarget,
    );
    if (end === null || end === current.end) return;

    const next = { ...current, end };
    drag.current = next;
    setPreview(next);
  }

  function finishDrag(event: PointerEvent<HTMLDivElement>, save: boolean) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;

    drag.current = null;
    setPreview(null);
    if (save) {
      const end = slotAt(
        document.elementFromPoint(event.clientX, event.clientY),
        event.currentTarget,
      );
      const lastSlot = end ?? current.end;
      setFocusedSlot(lastSlot);
      commit(current.start, lastSlot, current.select);
    }
  }

  function moveFocus(event: KeyboardEvent<HTMLElement>, index: number) {
    const column = index % columnCount;
    let next = index;
    switch (event.key) {
      case "ArrowLeft":
        next -= Number(column > 0);
        break;
      case "ArrowRight":
        next += Number(column < columnCount - 1);
        break;
      case "ArrowUp":
        next -= columnCount;
        break;
      case "ArrowDown":
        next += columnCount;
        break;
      case "Home":
        next = event.ctrlKey ? 0 : index - column;
        break;
      case "End":
        next = event.ctrlKey
          ? cells.length - 1
          : index + columnCount - column - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    event.currentTarget
      .closest('[role="grid"]')
      ?.querySelector<HTMLElement>(`[data-slot="${next}"]`)
      ?.focus();
  }

  function inspect(source: "pointer" | "focus", index: number | null) {
    const state = inspection.current;
    state[source] = index;
    const next = index ?? state[source === "pointer" ? "focus" : "pointer"];
    if (next === state.active) return;

    state.active = next;
    onInspectSlot?.(next === null ? null : (cells[next]?.slot ?? null));
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        role="grid"
        aria-label={ariaLabel ?? "Weekly schedule"}
        aria-readonly={!onChange}
        className="grid w-full pb-2 select-none"
        style={{
          gridTemplateColumns: `auto repeat(${columnCount}, minmax(0, 1fr))`,
        }}
        onPointerDown={onChange ? handlePointerDown : undefined}
        onPointerMove={onChange ? handlePointerMove : undefined}
        onPointerOver={
          onInspectSlot
            ? (event) =>
                inspect("pointer", slotAt(event.target, event.currentTarget))
            : undefined
        }
        onPointerLeave={
          onInspectSlot ? () => inspect("pointer", null) : undefined
        }
        onFocus={
          onInspectSlot
            ? (event) => {
                const index = slotAt(event.target, event.currentTarget);
                if (index !== null) setFocusedSlot(index);
                inspect("focus", index);
              }
            : undefined
        }
        onBlur={
          onInspectSlot
            ? (event) =>
                inspect(
                  "focus",
                  slotAt(event.relatedTarget, event.currentTarget),
                )
            : undefined
        }
        onPointerUp={onChange ? (event) => finishDrag(event, true) : undefined}
        onPointerCancel={
          onChange ? (event) => finishDrag(event, false) : undefined
        }
        onLostPointerCapture={
          onChange ? (event) => finishDrag(event, false) : undefined
        }
      >
        <div role="row" className="col-span-full grid grid-cols-subgrid">
          <div role="columnheader" aria-label="Time" />
          {weekdays.map((day) => (
            <div
              key={day}
              role="columnheader"
              aria-label={weekdayNames[day]}
              className="text-center text-sm font-medium"
            >
              {day}
            </div>
          ))}
        </div>
        <div role="rowgroup" className="col-span-full grid grid-cols-subgrid">
          {rows.map(({ cells: rowCells, hourLabel }, row) => (
            <div
              key={row}
              role="row"
              className="col-span-full grid grid-cols-subgrid"
              style={{
                height: `calc(var(--schedule-hour-height, 40px) * ${resolution / 60})`,
              }}
            >
              <div
                role="rowheader"
                className="grid pr-2 text-right text-xs font-medium whitespace-nowrap"
              >
                {hourLabel && (
                  <span className="col-start-1 row-start-1 h-0 self-start">
                    <span className="block -translate-y-1/2">{hourLabel}</span>
                  </span>
                )}
                {row === rows.length - 1 && (
                  <span className="col-start-1 row-start-1 h-0 self-end">
                    <span className="block -translate-y-1/2">
                      {closingLabel}
                    </span>
                  </span>
                )}
              </div>
              {rowCells.map(({ key, label }, day) => {
                const index = row * columnCount + day;
                const cellClass = cn(
                  "border-r-border/70 h-full min-h-0 border-r border-b",
                  (startMinute + (row + 1) * resolution) % 60 === 0
                    ? "border-b-border"
                    : "border-b-border/50",
                  row === 0 && day === 0 && "rounded-tl-md",
                  row === 0 && day === columnCount - 1 && "rounded-tr-md",
                  row === rows.length - 1 && day === 0 && "rounded-bl-md",
                  row === rows.length - 1 &&
                    day === columnCount - 1 &&
                    "rounded-br-md",
                );

                const inPreview =
                  preview &&
                  inRectangle(index, preview.start, preview.end, columnCount);
                const pressed = inPreview ? preview.select : selected.has(key);
                const status = appearance?.bySlot[key] ?? appearance?.default;
                const statusLabel =
                  status?.label ?? (pressed ? "Selected" : "Unselected");
                const selectedCellClass = cn(
                  cellClass,
                  status?.className ??
                    (pressed
                      ? "bg-primary/85 hover:bg-primary"
                      : "bg-muted hover:bg-muted/60"),
                );

                return onChange ? (
                  <div
                    key={index}
                    role="gridcell"
                    aria-selected={pressed}
                    className="min-h-0"
                  >
                    <button
                      type="button"
                      data-slot={index}
                      tabIndex={index === focusedSlot ? 0 : -1}
                      aria-label={label}
                      aria-pressed={pressed}
                      className={cn(
                        selectedCellClass,
                        "focus-visible:outline-ring block w-full touch-none focus-visible:outline-1 focus-visible:-outline-offset-2",
                      )}
                      style={status?.style}
                      onFocus={() => setFocusedSlot(index)}
                      onKeyDown={(event) => moveFocus(event, index)}
                      onClick={(event) => {
                        if (event.detail === 0) commit(index, index, !pressed);
                      }}
                    />
                  </div>
                ) : (
                  <div
                    key={index}
                    role="gridcell"
                    data-slot={onInspectSlot ? index : undefined}
                    tabIndex={
                      onInspectSlot
                        ? index === focusedSlot
                          ? 0
                          : -1
                        : undefined
                    }
                    aria-selected={appearance ? undefined : pressed}
                    aria-label={`${label}, ${statusLabel}`}
                    title={appearance ? statusLabel : undefined}
                    className={cn(
                      selectedCellClass,
                      onInspectSlot &&
                        "focus-visible:outline-ring focus-visible:outline-1 focus-visible:-outline-offset-2",
                    )}
                    style={status?.style}
                    onKeyDown={
                      onInspectSlot
                        ? (event) => moveFocus(event, index)
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
