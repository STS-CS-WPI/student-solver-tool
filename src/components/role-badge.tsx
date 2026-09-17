import type { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const roleColors: Record<Role, string> = {
  PLA: "bg-orange-600/10 text-orange-700 focus-visible:ring-orange-600/20 dark:bg-orange-600/20 dark:text-orange-300 dark:focus-visible:ring-orange-600/40 [a]:hover:bg-orange-600/20",
  TA: "bg-lime-600/10 text-lime-700 focus-visible:ring-lime-600/20 dark:bg-lime-600/20 dark:text-lime-300 dark:focus-visible:ring-lime-600/40 [a]:hover:bg-lime-600/20",
  GLA: "bg-teal-600/10 text-teal-700 focus-visible:ring-teal-600/20 dark:bg-teal-600/20 dark:text-teal-300 dark:focus-visible:ring-teal-600/40 [a]:hover:bg-teal-600/20",
  PROFESSOR:
    "bg-sky-600/10 text-sky-700 focus-visible:ring-sky-600/20 dark:bg-sky-600/20 dark:text-sky-300 dark:focus-visible:ring-sky-600/40 [a]:hover:bg-sky-600/20",
  COORDINATOR:
    "bg-violet-600/10 text-violet-700 focus-visible:ring-violet-600/20 dark:bg-violet-600/20 dark:text-violet-300 dark:focus-visible:ring-violet-600/40 [a]:hover:bg-violet-600/20",
};

export function RoleBadges({ roles }: { roles: readonly string[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {roles.map((role) => (
        <Badge
          key={role}
          variant="soft"
          className={
            Object.hasOwn(roleColors, role)
              ? roleColors[role as Role]
              : undefined
          }
        >
          {role}
        </Badge>
      ))}
    </span>
  );
}
