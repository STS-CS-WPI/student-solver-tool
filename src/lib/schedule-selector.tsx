export const WEEKDAYS = ["M", "T", "W", "R", "F"] as const;

// Visual styles + titles for each state
export const stylesByStatus = {
  "not-needed": {
    cls: "bg-muted/40 hover:bg-muted/60",
    title: "Not needed",
  },
  "not-needed-assigned": {
    cls: "bg-amber-500/80 hover:bg-amber-500 text-amber-50",
    title: "Not needed - assigned",
  },
  "needed-assigned": {
    cls: "bg-green-600/85 hover:bg-green-600 text-green-50",
    title: "Needed - assigned",
  },
  "needed-unassigned": {
    cls: "bg-primary/85 hover:bg-primary text-red-50",
    title: "Needed - not assigned",
  },
} as const;
