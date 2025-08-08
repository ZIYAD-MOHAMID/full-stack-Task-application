"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/trpc-provider";
import { XIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { todoTasck } from "../types/todo";

interface CreateTodoModalProps {
  open: boolean;
  onClose: () => void;
  updateTasck?: todoTasck;
}

export function CreateTodoModal({
  open,
  onClose,
  updateTasck,
}: CreateTodoModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  >("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const utils = api.useUtils();

  const createMutation = api.todo.create.useMutation({
    onSuccess: () => {
      toast.success("Todo created successfully!");
      utils.todo.getAll.invalidate();
      utils.todo.getStats.invalidate();
      onClose();
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateMutation = api.todo.update.useMutation({
    onSuccess: () => {
      toast.success("Todo updated successfully!");
      utils.todo.getAll.invalidate();
      utils.todo.getStats.invalidate();
      onClose();
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    const todoData = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    };

    if (updateTasck) {
      updateMutation.mutate({ ...todoData, id: updateTasck.id });
    } else {
      createMutation.mutate(todoData);
    }
  };

  useEffect(() => {
    if (updateTasck) {
      setTitle(updateTasck.title);
      setDescription(updateTasck.description || "");
      setPriority(updateTasck.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT");
      setDueDate(updateTasck.dueDate ? updateTasck.dueDate.toString() : "");
    }
  }, [updateTasck]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Create New Todo
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter todo title..."
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter description (optional)..."
              />
            </div>

            <div>
              <label
                htmlFor="priority"
                className="block text-sm font-medium text-gray-700"
              >
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-700"
              >
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {createMutation.isLoading ? "Creating..." : "Create Todo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
