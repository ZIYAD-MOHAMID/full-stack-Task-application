export type todoTasck = {
  tags: {
    name: string;
    id: string;
    color: string;
  }[];
  category: {
    name: string;
    createdAt: Date;
    id: string;
    userId: string;
    updatedAt: Date;
    color: string;
    icon: string | null;
  } | null;
  status: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  categoryId: string | null;
  createdAt: Date;
  dueDate: Date | null;
  title: string;
  id: string;
  completedAt: Date | null;
  userId: string;
  updatedAt: Date;
};
