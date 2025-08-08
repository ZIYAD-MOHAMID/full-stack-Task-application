import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { todoRouter } from "./routers/todo";
import { categoryRouter } from "./routers/category";
import { tagRouter } from "./routers/tag";

export const appRouter = createTRPCRouter({
  todo: todoRouter,
  category: categoryRouter,
  tag: tagRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
