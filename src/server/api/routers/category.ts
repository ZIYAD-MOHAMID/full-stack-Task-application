import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const categoryRouter = createTRPCRouter({
  // Get all categories for the authenticated user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    return db.category.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            todos: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }),

  // Get a single category by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      const category = await db.category.findFirst({
        where: {
          id: input.id,
          userId: session.user.id,
        },
        include: {
          _count: {
            select: {
              todos: true,
            },
          },
        },
      });

      if (!category) {
        throw new Error("Category not found");
      }

      return category;
    }),

  // Create a new category
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").default("#3b82f6"),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      // Check if category name already exists for this user
      const existingCategory = await db.category.findFirst({
        where: {
          name: input.name,
          userId: session.user.id,
        },
      });

      if (existingCategory) {
        throw new Error("Category with this name already exists");
      }

      return db.category.create({
        data: {
          ...input,
          userId: session.user.id,
        },
        include: {
          _count: {
            select: {
              todos: true,
            },
          },
        },
      });
    }),

  // Update a category
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { id, ...updateData } = input;

      // Verify ownership
      const existingCategory = await db.category.findFirst({
        where: { id, userId: session.user.id },
      });

      if (!existingCategory) {
        throw new Error("Category not found or access denied");
      }

      // Check if name already exists for this user (excluding current category)
      if (updateData.name) {
        const duplicateCategory = await db.category.findFirst({
          where: {
            name: updateData.name,
            userId: session.user.id,
            id: { not: id },
          },
        });

        if (duplicateCategory) {
          throw new Error("Category with this name already exists");
        }
      }

      return db.category.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: {
              todos: true,
            },
          },
        },
      });
    }),

  // Delete a category
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      const category = await db.category.findFirst({
        where: {
          id: input.id,
          userId: session.user.id,
        },
        include: {
          _count: {
            select: {
              todos: true,
            },
          },
        },
      });

      if (!category) {
        throw new Error("Category not found or access denied");
      }

      // If category has todos, set their categoryId to null instead of deleting
      if (category._count.todos > 0) {
        await db.todo.updateMany({
          where: { categoryId: input.id },
          data: { categoryId: null },
        });
      }

      await db.category.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
