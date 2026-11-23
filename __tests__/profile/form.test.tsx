import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { SavedProfile } from "@/types/form-inputs";

const { refresh, saveProfile } = vi.hoisted(() => ({
  refresh: vi.fn(),
  saveProfile: vi.fn<(form: FormData) => Promise<SavedProfile>>(),
}));
vi.mock("@/trpc/react", () => ({
  api: {
    profile: { save: { useMutation: () => ({ mutateAsync: saveProfile }) } },
  },
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/components/profile-avatar", () => ({
  ProfileAvatar: ({
    filename,
    preview,
  }: {
    filename: string | null;
    preview?: string;
  }) => (
    <span data-testid="photo" data-filename={filename} data-preview={preview} />
  ),
}));
import SettingsProfile from "@/app/profile/profile-form";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let container: HTMLDivElement;
let root: Root;
const createURL = vi.fn(() => "blob:preview");
const revokeURL = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createURL,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeURL,
  });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() =>
    root.render(
      <SettingsProfile
        defaultValues={{
          name: "Owner Name",
          email: "owner@example.com",
          profilePictureFilename: "saved.webp",
        }}
      />,
    ),
  );
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function button(label: string) {
  const result = Array.from(container.querySelectorAll("button")).find(
    (element) =>
      element.textContent === label ||
      element.getAttribute("aria-label") === label,
  );
  expect(result).toBeDefined();
  return result!;
}

async function select(
  file = new File(["photo"], "photo.png", { type: "image/png" }),
) {
  const input =
    container.querySelector<HTMLInputElement>('input[type="file"]')!;
  Object.defineProperty(input, "files", { configurable: true, value: [file] });
  await act(async () => {
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  return file;
}

it("previews locally, cancels without saving, and revokes the object URL", async () => {
  expect(button("Save Changes").disabled).toBe(true);
  expect(button("Choose profile photo")).toBeDefined();
  await select();
  expect(
    container
      .querySelector('[data-testid="photo"]')
      ?.getAttribute("data-preview"),
  ).toBe("blob:preview");
  act(() => button("Cancel").click());
  expect(
    container
      .querySelector('[data-testid="photo"]')
      ?.getAttribute("data-preview"),
  ).toBeNull();
  expect(
    container
      .querySelector('[data-testid="photo"]')
      ?.getAttribute("data-filename"),
  ).toBe("saved.webp");
  expect(saveProfile).not.toHaveBeenCalled();
  expect(revokeURL).toHaveBeenCalledWith("blob:preview");
});

it("keeps failed selections for retry, then saves and refreshes the sidebar", async () => {
  saveProfile.mockRejectedValueOnce(new Error("Disk is full. Try again."));
  const file = await select();
  await act(async () => button("Save Changes").click());
  expect(container.querySelector('[role="alert"]')?.textContent).toBe(
    "Disk is full. Try again.",
  );
  expect(
    container
      .querySelector('[data-testid="photo"]')
      ?.getAttribute("data-filename"),
  ).toBe("saved.webp");
  expect(button("Save Changes").disabled).toBe(false);
  saveProfile.mockResolvedValueOnce({
    name: "Owner Name",
    profilePictureFilename: "new.webp",
  });
  await act(async () => button("Save Changes").click());
  const body = saveProfile.mock.calls.at(-1)![0];
  expect([...body.keys()]).toEqual(["picture"]);
  expect(body.get("picture")).toBe(file);
  expect(
    container
      .querySelector('[data-testid="photo"]')
      ?.getAttribute("data-filename"),
  ).toBe("new.webp");
  expect(container.querySelector('[role="status"]')?.textContent).toBe(
    "Profile saved.",
  );
  expect(button("Save Changes").disabled).toBe(true);
  expect(refresh).toHaveBeenCalledOnce();
  expect(revokeURL).toHaveBeenCalledWith("blob:preview");
});

it("disables selection, save, and cancellation while saving", async () => {
  let finish!: (profile: SavedProfile) => void;
  saveProfile.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  await select();
  act(() => button("Save Changes").click());
  expect(button("Saving…").disabled).toBe(true);
  expect(button("Choose profile photo").disabled).toBe(true);
  expect(container.querySelector<HTMLInputElement>("#name")?.disabled).toBe(
    true,
  );
  expect(button("Cancel").disabled).toBe(true);
  await act(async () => {
    finish({ name: "Owner Name", profilePictureFilename: "new.webp" });
  });
});

it.each([
  new File(["bad"], "image.gif", { type: "image/gif" }),
  new File([new Uint8Array(2 * 1024 * 1024 + 1)], "large.png", {
    type: "image/png",
  }),
])("shows an accessible validation error for $name", async (file) => {
  await select(file);
  expect(container.querySelector('[role="alert"]')?.textContent).not.toBe("");
  expect(button("Save Changes").disabled).toBe(true);
  expect(saveProfile).not.toHaveBeenCalled();
});

it("revokes a selected preview on unmount", async () => {
  await select();
  act(() => root.unmount());
  expect(revokeURL).toHaveBeenCalledWith("blob:preview");
  root = createRoot(container);
});

function editName(value: string) {
  const input = container.querySelector<HTMLInputElement>("#name")!;
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

it("has one save action, read-only email, and submits a name-only form with normalization", async () => {
  expect(container.querySelectorAll('button[type="submit"]')).toHaveLength(1);
  expect(container.querySelector<HTMLInputElement>("#email")?.readOnly).toBe(
    true,
  );
  editName(" Last, First ");
  expect(button("Save Changes").disabled).toBe(false);
  saveProfile.mockResolvedValueOnce({
    name: "First Last",
    profilePictureFilename: "saved.webp",
  });
  await act(async () => {
    container
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
  const body = saveProfile.mock.calls.at(-1)![0];
  expect([...body.entries()]).toEqual([["name", " Last, First "]]);
  expect(container.querySelector<HTMLInputElement>("#name")?.value).toBe(
    "First Last",
  );
  expect(button("Save Changes").disabled).toBe(true);
  expect(refresh).toHaveBeenCalledOnce();
});

it("submits name and photo together, preserving both drafts after a failure", async () => {
  editName("Changed Owner");
  const file = await select();
  saveProfile.mockRejectedValueOnce(new Error("Please retry"));
  await act(async () => button("Save Changes").click());
  const body = saveProfile.mock.calls.at(-1)![0];
  expect(body.get("name")).toBe("Changed Owner");
  expect(body.get("picture")).toBe(file);
  expect(container.querySelector<HTMLInputElement>("#name")?.value).toBe(
    "Changed Owner",
  );
  expect(
    container
      .querySelector('[data-testid="photo"]')
      ?.getAttribute("data-preview"),
  ).toBe("blob:preview");
  expect(button("Save Changes").disabled).toBe(false);
  expect(refresh).not.toHaveBeenCalled();
});

it("resets both drafts with Cancel and only the photo with the selection X", async () => {
  editName("Changed Owner");
  await select();
  act(() => button("Cancel selected photo").click());
  expect(container.querySelector<HTMLInputElement>("#name")?.value).toBe(
    "Changed Owner",
  );
  expect(button("Save Changes").disabled).toBe(false);
  expect(
    container
      .querySelector('[data-testid="photo"]')
      ?.getAttribute("data-preview"),
  ).toBeNull();
  await select();
  act(() => button("Cancel").click());
  expect(container.querySelector<HTMLInputElement>("#name")?.value).toBe(
    "Owner Name",
  );
  expect(button("Save Changes").disabled).toBe(true);
  expect(saveProfile).not.toHaveBeenCalled();
});

it.each([" ", ",", "x".repeat(201)])(
  "rejects invalid name %s before sending a selected photo",
  async (name) => {
    editName(name);
    await select();
    await act(async () => button("Save Changes").click());
    expect(container.querySelector('[role="alert"]')?.textContent).not.toBe("");
    expect(saveProfile).not.toHaveBeenCalled();
  },
);

it("can save a photo without changing an existing null name", async () => {
  act(() =>
    root.render(
      <SettingsProfile
        key="null-name"
        defaultValues={{
          name: null,
          email: "owner@example.com",
          profilePictureFilename: null,
        }}
      />,
    ),
  );
  await select();
  saveProfile.mockResolvedValueOnce({
    name: null,
    profilePictureFilename: "new.webp",
  });
  await act(async () => button("Save Changes").click());
  const body = saveProfile.mock.calls.at(-1)![0];
  expect([...body.keys()]).toEqual(["picture"]);
  expect(container.querySelector<HTMLInputElement>("#name")?.value).toBe("");
  expect(button("Save Changes").disabled).toBe(true);
});
