import type { Role } from "@prisma/client";

export const testingPasswordMap: Record<string, Role[]> = {
  testpla: ["PLA"],
  testta: ["TA"],
  testgla: ["GLA"],
  testprof: ["PROFESSOR"],
  testcoordinator: ["PROFESSOR", "COORDINATOR"],
} as const;
