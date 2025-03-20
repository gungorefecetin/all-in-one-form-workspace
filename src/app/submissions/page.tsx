"use client";

import Link from "next/link";
import SubmissionsManager from "@/app/components/submissions/SubmissionsManager";

export default function SubmissionsPage() {
  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Form Submissions</h1>
            <p className="text-sm text-gray-500">Manage and track all form responses</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Return to Home
          </Link>
        </div>
        <SubmissionsManager />
      </div>
    </main>
  );
} 