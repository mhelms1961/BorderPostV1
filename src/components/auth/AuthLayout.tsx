import React from "react";
import { Link } from "react-router-dom";
import { Square } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900"
          >
            <Square className="h-6 w-6" />
            BorderPost
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to BorderPost
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            The easiest way to add professional borders to your videos
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
