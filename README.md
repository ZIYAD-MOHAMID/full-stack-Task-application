# tRPC Task App

A modern **full-stack Task application** built with the **T3 Stack** (Next.js, TypeScript, TailwindCSS, tRPC, Prisma, NextAuth) and **PostgreSQL**.  
It supports **user authentication**, **role-based data ownership**, **categories**, **tags**, and **task management** with priorities, statuses, and due dates.

---

## 🚀 Features

- **Authentication & Authorization**
  - Secure login via **NextAuth**
  - Email/Password & OAuth providers (Google, GitHub)
  - Session-based access control

- **Task Management**
  - Create, update, delete tasks
  - Task statuses: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
  - Task priorities: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
  - Due dates & completion timestamps
  - Category & tag assignments

- **Categories & Tags**
  - Custom categories per user (unique names)
  - Color-coded categories and tags
  - Tag-based task organization

- **Database**
  - **PostgreSQL** via Docker
  - **Prisma ORM** with schema-based modeling
  - Migrations & seeding support

- **Developer Experience**
  - **tRPC** for end-to-end type-safe APIs
  - **React Query** for client-side data fetching
  - TailwindCSS & Headless UI for styling
  - Framer Motion for animations
  - ESLint, Prettier, TypeScript for clean code

---

## 🛠 Tech Stack

- **Frontend:** Next.js, React, TypeScript, TailwindCSS, Headless UI, Framer Motion
- **Backend:** Next.js API Routes, tRPC, Prisma
- **Database:** PostgreSQL (Docker)
- **Auth:** NextAuth.js
- **State/Data:** React Query, tRPC
- **Utilities:** Zod, clsx, tailwind-merge, react-hot-toast, date-fns

---

## 📦 Installation & Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/ZIYAD-MOHAMID/full-stack-Task-application
   cd trpc-todo-app
   ```
