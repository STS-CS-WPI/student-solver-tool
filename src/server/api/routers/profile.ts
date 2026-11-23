import { z } from "zod";
import { TRPCError, type TRPC_ERROR_CODE_KEY } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "@/env";
import {
  MAX_PICTURE_BYTES,
  PictureError,
  readPicture,
  saveProfile,
} from "@/server/profile-pictures";

const MAX_BODY_BYTES = MAX_PICTURE_BYTES + 16 * 1024;
const errorCodes: Record<number, TRPC_ERROR_CODE_KEY> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  408: "TIMEOUT",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  415: "UNSUPPORTED_MEDIA_TYPE",
};

function profileError(error: unknown) {
  if (error instanceof TRPCError) return error;
  if (error instanceof PictureError) {
    return new TRPCError({
      code: errorCodes[error.status] ?? "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
  console.error("Profile request failed", error);
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Your profile could not be saved or loaded. Please try again.",
  });
}

function checkOrigin(request: Request) {
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
    if (
      origin.origin !== request.headers.get("origin") ||
      origin.host !== request.headers.get("host") ||
      !(
        origin.protocol === "https:" ||
        (env.NODE_ENV !== "production" && local && origin.protocol === "http:")
      )
    ) {
      throw new Error("Invalid origin");
    }
  } catch {
    throw new PictureError(403, "Please save your profile from this website.");
  }
}

async function readUpload(request: Request) {
  const reader = request.body?.getReader();
  if (!reader)
    throw new PictureError(400, "Change your name or choose a photo first.");
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
      throw new PictureError(
        413,
        "The profile upload is too large. Choose a photo up to 2 MiB.",
      );
    }
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(
            new PictureError(
              408,
              "Your upload took too long. Please try again.",
            ),
          ),
        15_000,
      );
    });
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await Promise.race([reader.read(), timeout]);
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES)
        throw new PictureError(
          413,
          "The profile upload is too large. Choose a photo up to 2 MiB.",
        );
      chunks.push(value);
    }
    return Buffer.concat(chunks, length);
  } finally {
    clearTimeout(timer);
    void reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

async function readProfileForm(request: Request) {
  const body = await readUpload(request);
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!/^multipart\/form-data(?:;|$)/i.test(contentType))
      throw new Error("Invalid content type");
    return await new Response(new Uint8Array(body), {
      headers: { "Content-Type": contentType },
    }).formData();
  } catch {
    throw new PictureError(
      400,
      "Your profile upload could not be read. Please try again.",
    );
  }
}

export const profileRoute = createTRPCRouter({
  save: protectedProcedure
    .use(async ({ ctx, next }) => {
      if (!ctx.request) return next();
      try {
        checkOrigin(ctx.request);
        // Cap the stream before tRPC's default FormData parser reads it.
        const form = await readProfileForm(ctx.request);
        return next({ getRawInput: async () => form });
      } catch (error) {
        throw profileError(error);
      }
    })
    .input(z.instanceof(FormData))
    .mutation(async ({ ctx, input }) => {
      try {
        const changes: { name?: string; picture?: Buffer } = {};
        const fields = new Set<string>();
        for (const [key, value] of input) {
          if (fields.has(key) || !["name", "picture"].includes(key))
            throw new PictureError(400, "Submit only one name and one photo.");
          fields.add(key);
          if (key === "name") {
            if (typeof value !== "string")
              throw new PictureError(400, "Name must be text.");
            changes.name = value;
          } else {
            if (typeof value === "string")
              throw new PictureError(400, "Choose a valid photo file.");
            if (value.size > MAX_PICTURE_BYTES)
              throw new PictureError(413, "Choose a photo up to 2 MiB.");
            changes.picture = Buffer.from(await value.arrayBuffer());
          }
        }
        return await saveProfile(ctx.session.user.id, changes);
      } catch (error) {
        throw profileError(error);
      }
    }),

  getPicture: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { profilePictureFilename: true },
      });
      const picture =
        user?.profilePictureFilename &&
        (await readPicture(user.profilePictureFilename));
      if (!picture) throw new PictureError(404, "No profile photo found.");
      return new Uint8Array(picture);
    } catch (error) {
      throw profileError(error);
    }
  }),
});
