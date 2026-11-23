import { Children, isValidElement, type ReactNode } from "react";
import type { Session } from "next-auth";
import { beforeEach, expect, it, vi } from "vitest";

const { findUnique, auth } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  auth: vi.fn(),
}));
vi.mock("@/server/db", () => ({ db: { user: { findUnique } } }));
vi.mock("@/server/auth", () => ({ auth, signOut: vi.fn() }));
vi.mock("@/server/auth/providers", () => ({ providers: [] }));
vi.mock("@/env", () => ({ env: { NODE_ENV: "test" } }));
vi.mock("@auth/prisma-adapter", () => ({ PrismaAdapter: () => ({}) }));

import { NavUser } from "@/components/sidebar/nav-user";
import { ProfileAvatar } from "@/components/profile-avatar";
import { authConfig } from "@/server/auth/config";

beforeEach(() => vi.resetAllMocks());

it("uses the saved database name and photo in both sidebar account locations", async () => {
  auth.mockResolvedValue({
    user: { id: "owner", name: "Stale Name", email: "owner@example.com" },
  });
  findUnique.mockResolvedValue({
    name: "Saved Name",
    profilePictureFilename: "saved.webp",
  });
  const labels: string[] = [];
  const pictures: (string | null | undefined)[] = [];
  function visit(node: ReactNode) {
    Children.forEach(node, (child) => {
      if (typeof child === "string") labels.push(child);
      if (
        isValidElement<{ children?: ReactNode; filename?: string | null }>(
          child,
        )
      ) {
        if (child.type === ProfileAvatar) pictures.push(child.props.filename);
        visit(child.props.children);
      }
    });
  }
  visit(await NavUser());
  expect(findUnique).toHaveBeenCalledExactlyOnceWith({
    where: { id: "owner" },
    select: { name: true, profilePictureFilename: true },
  });
  expect(labels.filter((label) => label === "Saved Name")).toHaveLength(2);
  expect(labels).not.toContain("Stale Name");
  expect(pictures).toEqual(["saved.webp", "saved.webp"]);
});

it("refreshes JWT names and roles from the database, ignoring session-update values", async () => {
  findUnique.mockResolvedValue({ name: "Saved Name", roles: [{ role: "TA" }] });
  const token = await authConfig.callbacks.jwt({
    token: { id: "owner", name: "Stale Name", roles: ["COORDINATOR"] },
    user: { id: "owner" },
    account: null,
    trigger: "update",
    session: { name: "Untrusted Name", roles: ["COORDINATOR"] },
  });
  expect(findUnique).toHaveBeenCalledExactlyOnceWith({
    where: { id: "owner" },
    select: { name: true, roles: { select: { role: true } } },
  });
  expect(token).toMatchObject({
    id: "owner",
    name: "Saved Name",
    roles: ["TA"],
  });
});

it.each(["Saved Name", null])(
  "updates the session name without changing email or authorization roles: %s",
  async (name) => {
    const session: Session = {
      expires: "2099-01-01",
      user: {
        id: "owner",
        name: "Stale Name",
        email: "owner@example.com",
        roles: [],
      },
    };
    const result = await authConfig.callbacks.session({
      session,
      token: { id: "owner", name, roles: ["TA"] },
    } as Parameters<typeof authConfig.callbacks.session>[0]);
    expect(result.user).toMatchObject({
      id: "owner",
      name,
      email: "owner@example.com",
      roles: ["TA"],
    });
  },
);
