'use client';

import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft } from 'lucide-react';

export default function FormsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Create New Form</h1>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="flex flex-col items-center">
            <p className="text-gray-500 mb-8">Start creating your new form by clicking the button below</p>
            <button
              onClick={() => router.push('/forms/builder')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Form
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 