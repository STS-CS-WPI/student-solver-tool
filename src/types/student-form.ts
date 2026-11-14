import type { RouterOutputs } from "@/trpc/react";

export type StudentFormCourse =
  RouterOutputs["studentForm"]["getSections"]["sections"][number];
