import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { headers, cookies } from "next/headers";

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  const session = await getServerAuthSession({ req, res });

  return {
    session,
    db,
  };
  // const cookieHeader = opts.req.headers.get("cookie") ?? "";
  // const session = await getServerAuthSession({
  //   cookie: cookieHeader,
  // });
  // return {
  //   db,
  //   session,
  //   headers: opts.req.headers,
  // };

  // const session = await getServerAuthSession();
  // return {
  //   db,
  //   session,
  //   headers: headers(),
  //   cookies: cookies(),
  // };
};
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});
export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});
