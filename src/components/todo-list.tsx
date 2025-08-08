"use client";

import { api } from "@/lib/trpc-provider";
import {
  CheckCircleIcon,
  CircleIcon,
  PenBoxIcon,
  PinIcon,
  TrashIcon,
} from "lucide-react";
import { formatDate, getPriorityColor, getStatusColor } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { CreateTodoModal } from "./create-todo-modal";
import { useState } from "react";
import { todoTasck } from "../types/todo";

interface TodoListProps {
  filter: {
    status?: string;
    priority?: string;
    categoryId?: string;
    search?: string;
  };
}

export function TodoList({ filter }: TodoListProps) {
  const { data, isLoading, refetch } = api.todo.getAll.useQuery({
    status: filter.status as any,
    priority: filter.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    categoryId: filter.categoryId,
    search: filter.search,
  });

  const toggleMutation = api.todo.toggleComplete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Todo updated!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteMutation = api.todo.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Todo deleted!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleToggleComplete = (id: string) => {
    toggleMutation.mutate({ id });
  };
  const handleDeleteComplete = (id: string) => {
    deleteMutation.mutate({ id });
  };
  const [ubdateModalOpen, setUbdateModalOpen] = useState(false);
  const [theTasck, settheTasck] = useState<todoTasck | undefined>(undefined);
  const handleUbdateComplete = (todo: todoTasck) => {
    settheTasck(todo);
    setUbdateModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="flex items-center space-x-4">
                <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const todos = data?.todos || [];

  if (todos.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <CheckCircleIcon className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No todos found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter.status || filter.categoryId || filter.search
              ? "Try adjusting your filters"
              : "Get started by creating a new todo"}
          </p>
        </div>
      </div>
    );
  }
  const todoStute = (e: string): string => {
    return e === "LOW"
      ? "LOW"
      : e === "MEDIUM"
        ? "MEDIUM"
        : e === "HIGH"
          ? "HIGH"
          : "URGENT";
  };
  return (
    <>
      <CreateTodoModal
        open={ubdateModalOpen}
        onClose={() => setUbdateModalOpen(false)}
        updateTasck={theTasck}
      />
      <div className="p-6">
        <div className="space-y-4">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 priority-${todo.priority.toLowerCase()}`}
            >
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => handleToggleComplete(todo.id)}
                  disabled={toggleMutation.isLoading}
                  className="mt-0.5 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {todo.status === "COMPLETED" ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <CircleIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDeleteComplete(todo.id)}
                  disabled={deleteMutation.isLoading}
                  className="mt-0.5 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleUbdateComplete(todo)}
                  disabled={deleteMutation.isLoading}
                  className="mt-0.5 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <PenBoxIcon className="h-5 w-5" />
                </button>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-lg font-medium ${
                      todo.status === "COMPLETED"
                        ? "line-through text-gray-500"
                        : "text-gray-900"
                    }`}
                  >
                    {todo.title}
                  </h3>

                  {todo.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {todo.description}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {/* Status badge */}
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        todo.status as
                          | "PENDING"
                          | "IN_PROGRESS"
                          | "COMPLETED"
                          | "CANCELLED"
                      )}`}
                    >
                      {todo.status.replace("_", " ")}
                    </span>

                    {/* Priority badge */}
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                        todo.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT"
                      )}`}
                    >
                      {todo.priority}
                    </span>

                    {/* Category */}
                    {todo.category && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-600">
                        {todo.category.name}
                      </span>
                    )}

                    {/* Due date */}
                    {todo.dueDate && (
                      <span className="text-xs text-gray-500">
                        Due: {formatDate(new Date(todo.dueDate))}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {todo.tags && todo.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {todo.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: tag.color + "20",
                            color: tag.color,
                          }}
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
