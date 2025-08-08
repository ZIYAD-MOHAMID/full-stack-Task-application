import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

// Define our enum-like types
const Priority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

const TodoStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

type Priority = (typeof Priority)[keyof typeof Priority];
type TodoStatus = (typeof TodoStatus)[keyof typeof TodoStatus];

export const todoRouter = createTRPCRouter({
  // Get all todos for the authenticated user
  getAll: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
          .optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        categoryId: z.string().optional(),
        search: z.string().optional(),
        sortBy: z
          .enum(["createdAt", "dueDate", "priority", "title"])
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const {
        status,
        priority,
        categoryId,
        search,
        sortBy,
        sortOrder,
        limit,
        cursor,
      } = input;

      const where: any = {
        userId: session.user.id,
      };

      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (categoryId) where.categoryId = categoryId;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const todos = await db.todo.findMany({
        where,
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (todos.length > limit) {
        const nextItem = todos.pop();
        nextCursor = nextItem!.id;
      }

      return {
        todos: todos.map((todo) => ({
          ...todo,
          tags: todo.tags.map((tt) => tt.tag),
        })),
        nextCursor,
      };
    }),

  // Get a single todo by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;

      const todo = await db.todo.findFirst({
        where: {
          id: input.id,
          userId: session.user.id,
        },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      if (!todo) {
        throw new Error("Todo not found");
      }

      return {
        ...todo,
        tags: todo.tags.map((tt) => tt.tag),
      };
    }),

  // Create a new todo
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        categoryId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      const todo = await db.todo.create({
        data: {
          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
          priority: input.priority,
          categoryId: input.categoryId,
          userId: session.user.id,
        },
      });

      return todo;
    }),
  // Update a todo
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Title is required").optional(),
        description: z.string().optional(),
        status: z
          .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
          .optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        dueDate: z.date().optional(),
        categoryId: z.string().optional(),
        tagIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const { id, tagIds, ...updateData } = input;

      // Verify ownership
      const existingTodo = await db.todo.findFirst({
        where: { id, userId: session.user.id },
      });

      if (!existingTodo) {
        throw new Error("Todo not found or access denied");
      }

      // Handle completion status
      const completedAt =
        updateData.status === TodoStatus.COMPLETED &&
        existingTodo.status !== TodoStatus.COMPLETED
          ? new Date()
          : updateData.status !== TodoStatus.COMPLETED
            ? null
            : undefined;

      const updatedTodo = await db.todo.update({
        where: { id },
        data: {
          ...updateData,
          completedAt,
          ...(tagIds && {
            tags: {
              deleteMany: {
                NOT: {
                  tagId: { in: tagIds },
                },
              },
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            },
          }),
        },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return {
        ...updatedTodo,
        tags: updatedTodo.tags.map((tt) => tt.tag),
      };
    }),

  // Delete a todo
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      const todo = await db.todo.findFirst({
        where: {
          id: input.id,
          userId: session.user.id,
        },
      });
      if (!todo) {
        throw new Error("Todo not found or access denied");
      }

      await db.todo.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle todo completion status
  toggleComplete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      const todo = await db.todo.findFirst({
        where: {
          id: input.id,
          userId: session.user.id,
        },
      });
      if (!todo) {
        throw new Error("Todo not found or access denied");
      }

      const newStatus =
        todo.status === TodoStatus.COMPLETED
          ? TodoStatus.PENDING
          : TodoStatus.COMPLETED;
      const completedAt =
        newStatus === TodoStatus.COMPLETED ? new Date() : null;

      const updatedTodo = await db.todo.update({
        where: { id: input.id },
        data: {
          status: newStatus,
          completedAt,
        },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return {
        ...updatedTodo,
        tags: updatedTodo.tags.map((tt) => tt.tag),
      };
    }),

  // Get todo statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    const [total, completed, pending, inProgress, overdue] = await Promise.all([
      db.todo.count({
        where: { userId: session.user.id },
      }),
      db.todo.count({
        where: { userId: session.user.id, status: TodoStatus.COMPLETED },
      }),
      db.todo.count({
        where: { userId: session.user.id, status: TodoStatus.PENDING },
      }),
      db.todo.count({
        where: { userId: session.user.id, status: TodoStatus.IN_PROGRESS },
      }),
      db.todo.count({
        where: {
          userId: session.user.id,
          dueDate: { lt: new Date() },
          status: { not: TodoStatus.COMPLETED },
        },
      }),
    ]);

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }),
});
