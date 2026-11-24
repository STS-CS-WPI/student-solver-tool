import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";
import { env } from "@/env";
import { db } from "@/server/db";
import { profileNameSchema, type SavedProfile } from "@/types/form-inputs";

export const MAX_PICTURE_BYTES = 2 * 1024 * 1024;
const MAX_DIMENSION = 4096;
const filenamePattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/;

export class PictureError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function picturePath(filename: string) {
  if (!filenamePattern.test(filename)) return null;
  return join(resolve(env.PROFILE_PICTURE_DIR), filename);
}

export async function readPicture(filename: string) {
  const path = picturePath(filename);
  if (!path) return null;
  try {
    return await readFile(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function removePicture(filename: string | null) {
  const path = filename && picturePath(filename);
  if (!path) return;
  try {
    await unlink(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Could not remove an unused profile picture", error);
    }
  }
}

export async function normalizePicture(input: Buffer) {
  if (input.length > MAX_PICTURE_BYTES) {
    throw new PictureError(413, "Choose a photo smaller than 2 MiB.");
  }
  if (!input.length) throw new PictureError(400, "Choose a photo first.");
  try {
    const image = sharp(input, {
      limitInputPixels: MAX_DIMENSION ** 2,
      failOn: "warning",
    });
    const metadata = await image.metadata();
    if (
      !metadata.format ||
      !["jpeg", "png", "webp"].includes(metadata.format)
    ) {
      throw new PictureError(415, "Choose a static JPEG, PNG, or WebP photo.");
    }
    if ((metadata.pages ?? 1) > 1) {
      throw new PictureError(415, "Animated photos are not supported.");
    }
    // libvips can report only the first frame of APNG; check its animation chunk too.
    if (metadata.format === "png") {
      for (let offset = 8; offset + 12 <= input.length; ) {
        if (input.toString("ascii", offset + 4, offset + 8) === "acTL") {
          throw new PictureError(415, "Animated photos are not supported.");
        }
        offset += input.readUInt32BE(offset) + 12;
      }
    }
    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width > MAX_DIMENSION ||
      metadata.height > MAX_DIMENSION
    ) {
      throw new PictureError(
        400,
        "Photos must be at most 4096 pixels wide and tall.",
      );
    }
    return await image
      .rotate()
      .resize(256, 256, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (error) {
    if (error instanceof PictureError) throw error;
    throw new PictureError(
      400,
      "This photo could not be read. Choose a valid image up to 4096 pixels wide and tall.",
    );
  }
}

export async function saveProfile(
  userId: string,
  changes: { name?: string; picture?: Buffer },
): Promise<SavedProfile> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, profilePictureFilename: true },
  });
  if (!user) throw new PictureError(404, "Your account could not be found.");
  if (changes.name === undefined && changes.picture === undefined) {
    throw new PictureError(400, "Change your name or choose a photo first.");
  }
  let name: string | undefined;
  if (changes.name !== undefined) {
    const parsed = profileNameSchema.safeParse(changes.name);
    if (!parsed.success)
      throw new PictureError(400, parsed.error.issues[0]!.message);
    name = parsed.data;
  }

  let filename: string | null = null;
  if (changes.picture !== undefined) {
    const output = await normalizePicture(changes.picture);
    filename = `${randomUUID()}.webp`;
    const directory = resolve(env.PROFILE_PICTURE_DIR);
    await mkdir(directory, { recursive: true });
    try {
      await writeFile(join(directory, filename), output, {
        flag: "wx",
        mode: 0o600,
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST")
        await removePicture(filename);
      throw error;
    }
  }

  let count: number;
  try {
    ({ count } = await db.user.updateMany({
      where: {
        id: userId,
        name: user.name,
        profilePictureFilename: user.profilePictureFilename,
      },
      data: {
        ...(name === undefined ? {} : { name }),
        ...(filename ? { profilePictureFilename: filename } : {}),
      },
    }));
  } catch (error) {
    // A lost database response can hide a commit; only delete after checking its mapping.
    if (filename) {
      try {
        const current = await db.user.findUnique({
          where: { id: userId },
          select: { profilePictureFilename: true },
        });
        if (current?.profilePictureFilename !== filename)
          await removePicture(filename);
      } catch {
        console.error(
          "Profile commit could not be checked; retaining file for reconciliation.",
        );
      }
    }
    throw error;
  }
  if (!count) {
    await removePicture(filename);
    throw new PictureError(
      409,
      "Your profile changed during this save. Please try again.",
    );
  }
  if (filename) await removePicture(user.profilePictureFilename);
  return {
    name: name ?? user.name,
    profilePictureFilename: filename ?? user.profilePictureFilename,
  };
}
