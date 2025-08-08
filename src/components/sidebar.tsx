"use client";

import { ListTodoIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon, TagIcon, FolderIcon } from "lucide-react";

interface SidebarProps {
  activeFilter: {
    status?: string;
    priority?: string;
    categoryId?: string;
    search?: string;
  };
  onFilterChange: (filter: any) => void;
  stats?: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
    completionRate: number;
  };
}

export function Sidebar({ activeFilter, onFilterChange, stats }: SidebarProps) {
  const menuItems = [
    {
      name: "All Tasks",
      icon: ListTodoIcon,
      count: stats?.total || 0,
      filter: {},
    },
    {
      name: "Pending",
      icon: ClockIcon,
      count: stats?.pending || 0,
      filter: { status: "PENDING" },
    },
    {
      name: "In Progress",
      icon: ClockIcon,
      count: stats?.inProgress || 0,
      filter: { status: "IN_PROGRESS" },
    },
    {
      name: "Completed",
      icon: CheckCircleIcon,
      count: stats?.completed || 0,
      filter: { status: "COMPLETED" },
    },
    {
      name: "Overdue",
      icon: AlertCircleIcon,
      count: stats?.overdue || 0,
      filter: { overdue: true },
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = JSON.stringify(activeFilter) === JSON.stringify(item.filter);
          
          return (
            <button
              key={item.name}
              onClick={() => onFilterChange(item.filter)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                {item.count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Categories section (placeholder) */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <FolderIcon className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Categories</span>
        </div>
        <p className="text-xs text-gray-500">Categories will appear here</p>
      </div>
    </div>
  );
}
