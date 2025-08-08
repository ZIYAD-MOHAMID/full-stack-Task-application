import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const tagRouter = createTRPCRouter({
  // Get all tags
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    return db.tag.findMany({
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

  // Get popular tags (most used)
  getPopular: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      return db.tag.findMany({
        include: {
          _count: {
            select: {
              todos: true,
            },
          },
        },
        orderBy: {
          todos: {
            _count: "desc",
          },
        },
        take: input.limit,
      });
    }),

  // Create a new tag
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").default("#6b7280"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Check if tag already exists
      const existingTag = await db.tag.findFirst({
        where: {
          name: input.name.toLowerCase(),
        },
      });

      if (existingTag) {
        return existingTag; // Return existing tag instead of creating duplicate
      }

      return db.tag.create({
        data: {
          name: input.name.toLowerCase(),
          color: input.color,
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

  // Update a tag
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id, name, ...updateData } = input;

      const existingTag = await db.tag.findUnique({
        where: { id },
      });

      if (!existingTag) {
        throw new Error("Tag not found");
      }

      // Check if name already exists (excluding current tag)
      if (name) {
        const duplicateTag = await db.tag.findFirst({
          where: {
            name: name.toLowerCase(),
            id: { not: id },
          },
        });

        if (duplicateTag) {
          throw new Error("Tag with this name already exists");
        }
      }

      return db.tag.update({
        where: { id },
        data: {
          ...updateData,
          ...(name && { name: name.toLowerCase() }),
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

  // Delete a tag
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const tag = await db.tag.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              todos: true,
            },
          },
        },
      });

      if (!tag) {
        throw new Error("Tag not found");
      }

      // Delete the tag (this will cascade delete TodoTag relationships)
      await db.tag.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Search tags by name
  search: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      return db.tag.findMany({
        where: {
          name: {
            contains: input.query.toLowerCase(),
          },
        },
        include: {
          _count: {
            select: {
              todos: true,
            },
          },
        },
        orderBy: [
          {
            todos: {
              _count: "desc",
            },
          },
          {
            name: "asc",
          },
        ],
        take: 10,
      });
    }),
});
