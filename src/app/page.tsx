"use client";

import { useSession } from "next-auth/react";
import { Dashboard } from "@/components/dashboard";
import { SignInPage } from "@/components/sign-in-page";

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return <SignInPage />;
  }

  return <Dashboard />;
}
