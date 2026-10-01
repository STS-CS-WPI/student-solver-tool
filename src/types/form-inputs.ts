import { Role, TermLetter } from "@prisma/client";
import z from "zod";
import { normalizeName } from "@/lib/utils";

export const createTermInputSchema = z.object({
  termLetter: z.nativeEnum(TermLetter),
  year: z.coerce.number().int().nonnegative(),
  termStaffDueDate: z.coerce.date(),
  termProfessorDueDate: z.coerce.date(),
});

// Names are stored as "First Last", the same format the course listing API uses.
// Legacy "Last, First" input is flipped automatically.
export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .transform(normalizeName);

export const createUserInputSchema = z.object({
  name: nameSchema,
  email: z.string().email(),
  role: z.nativeEnum(Role),
});

// The single-user form is typed by hand, so a comma there is rejected instead of
// flipped. (The CSV upload keeps using createUserInputSchema, which flips.)
export const createUserFormSchema = createUserInputSchema.extend({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .refine((name) => !name.includes(","), {
      message: 'Enter the name as "First Last", without a comma',
    }),
});

export const updateUserInputSchema = z.object({
  userId: z.string(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(Role).optional(),
  hours: z.coerce.number().int().nonnegative().optional(),
});
