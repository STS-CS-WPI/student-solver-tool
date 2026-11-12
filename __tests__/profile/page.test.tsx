import { beforeEach, expect, it, vi } from "vitest";

const { auth, findUnique, redirect, notFound } = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("@/server/auth", () => ({ auth }));
vi.mock("@/server/db", () => ({ db: { user: { findUnique } } }));
vi.mock("next/navigation", () => ({ redirect, notFound }));
vi.mock("@/app/profile/profile-form", () => ({
  default: () => null,
}));

import ProfilePage from "@/app/profile/page";

beforeEach(() => {
  vi.resetAllMocks();
  redirect.mockImplementation(() => {
    throw new Error("redirect");
  });
  notFound.mockImplementation(() => {
    throw new Error("not found");
  });
});

it("redirects unauthenticated visitors before querying the database", async () => {
  auth.mockResolvedValue(null);

  await expect(ProfilePage()).rejects.toThrow("redirect");
  expect(redirect).toHaveBeenCalledWith("/login?callbackUrl=%2Fprofile");
  expect(findUnique).not.toHaveBeenCalled();
});

it("loads only the signed-in user's full name and email", async () => {
  auth.mockResolvedValue({ user: { id: "current-user", name: "Stale name" } });
  const profile = { name: "Current Name", email: "current@example.com" };
  findUnique.mockResolvedValue(profile);

  const page = await ProfilePage();

  expect(findUnique).toHaveBeenCalledExactlyOnceWith({
    where: { id: "current-user" },
    select: { name: true, email: true },
  });
  expect(page).toMatchObject({ props: { defaultValues: profile } });
});

it("shows not found when the signed-in user's profile no longer exists", async () => {
  auth.mockResolvedValue({ user: { id: "deleted-user" } });
  findUnique.mockResolvedValue(null);

  await expect(ProfilePage()).rejects.toThrow("not found");
  expect(notFound).toHaveBeenCalledOnce();
});
