'use client';

import { useAppSelector, useAppDispatch } from '@/app/hooks/redux';
import Link from 'next/link';
import { Plus, FileText, ArrowLeft, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Menu } from '@headlessui/react';
import { useState } from 'react';
import { updateForm, deleteForm } from '@/app/features/formBuilder/formBuilderSlice';

export default function FormsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const forms = useAppSelector((state) => state.formBuilder.forms);
  const formsList = Object.values(forms);
  const [renamingForm, setRenamingForm] = useState<string | null>(null);
  const [newFormName, setNewFormName] = useState('');

  const handleRename = (formId: string, currentName: string) => {
    setRenamingForm(formId);
    setNewFormName(currentName);
  };

  const handleSaveRename = (form: any) => {
    if (newFormName.trim() && newFormName !== form.name) {
      dispatch(updateForm({
        id: form.id,
        updates: {
          ...form,
          name: newFormName,
          updatedAt: new Date().toISOString()
        }
      }));
    }
    setRenamingForm(null);
    setNewFormName('');
  };

  const handleDelete = (formId: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      dispatch(deleteForm(formId));
    }
  };

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
            <h1 className="text-2xl font-semibold text-gray-900">Forms</h1>
          </div>
          <button
            onClick={() => router.push('/forms/builder')}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Form
          </button>
        </div>

        {formsList.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <FileText className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first form</p>
              <button
                onClick={() => router.push('/forms/builder')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Form
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formsList.map((form) => (
              <div
                key={form.id}
                className="relative bg-white rounded-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-md hover:border-blue-500 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    {renamingForm === form.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newFormName}
                          onChange={(e) => setNewFormName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(form);
                            if (e.key === 'Escape') setRenamingForm(null);
                          }}
                          className="text-lg font-medium text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(form)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <Link href={`/forms/builder/${form.id}`}>
                        <h2 className="text-lg font-medium text-gray-900 truncate group-hover:text-blue-600">
                          {form.name}
                        </h2>
                      </Link>
                    )}
                    <p className="text-sm text-gray-500">
                      {form.fields.length} fields
                    </p>
                  </div>
                  <Menu as="div" className="relative">
                    <Menu.Button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                      <MoreVertical className="w-5 h-5" />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleRename(form.id, form.name)}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center w-full px-4 py-2 text-sm text-gray-700`}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Rename
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleDelete(form.id)}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center w-full px-4 py-2 text-sm text-red-600`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>
                <p className="text-sm text-gray-500">
                  Last updated {new Date(form.updatedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 