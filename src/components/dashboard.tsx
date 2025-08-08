"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { api } from "@/lib/trpc-provider";
import { Sidebar } from "./sidebar";
import { TodoList } from "./todo-list";
import { CreateTodoModal } from "./create-todo-modal";
import { StatsCards } from "./stats-cards";
import { PlusIcon, MenuIcon, XIcon } from "lucide-react";
import Image from "next/image";
import defaultImg from "../assets/noUser.webp";

export function Dashboard() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<{
    status?: string;
    priority?: string;
    categoryId?: string;
    search?: string;
  }>({});
  const { data: stats } = api.todo.getStats.useQuery();

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Todo App</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <Sidebar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          stats={stats}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col ">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeFilter.status
                    ? `${activeFilter.status} Tasks`
                    : activeFilter.categoryId
                      ? "Category Tasks"
                      : "All Tasks"}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Todo
              </button>

              {/* User menu */}
              <div className="relative group">
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={session?.user?.image || defaultImg}
                    alt="User avatar"
                    width={32}
                    height={32}
                  />
                  <span className="hidden sm:block text-sm font-medium">
                    {session?.user?.name || "User"}
                  </span>
                </button>
                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                  Log out
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            <StatsCards stats={stats} />
          </div>

          {/* Todo List */}
          <TodoList filter={activeFilter} />
        </div>
      </div>

      {/* Create Todo Modal */}
      <CreateTodoModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
