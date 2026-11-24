import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { profileRoute } from "@/server/api/routers/profile";
import { createTRPCContext } from "@/server/api/trpc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: Request) {
  try {
    const caller = profileRoute.createCaller(
      await createTRPCContext({ headers: request.headers }),
    );
    return new Response(await caller.getPicture(), {
      headers: { ...headers, "Content-Type": "image/webp" },
    });
  } catch (error) {
    const known = error instanceof TRPCError;
    return Response.json(
      {
        error: known
          ? error.message
          : "Your photo could not be loaded. Please try again.",
      },
      { status: known ? getHTTPStatusCodeFromError(error) : 500, headers },
    );
  }
}
