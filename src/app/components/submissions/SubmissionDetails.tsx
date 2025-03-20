"use client";

import { FormSubmission } from "@/app/types/submissions";
import { Form } from "@/app/types/form";
import { useState } from "react";

interface Props {
  submission: FormSubmission;
  form: Form;
  onClose: () => void;
  onUpdate: (updatedSubmission: FormSubmission) => void;
}

export const SubmissionDetails: React.FC<Props> = ({
  submission,
  form,
  onClose,
  onUpdate,
}) => {
  const [editedData, setEditedData] = useState(submission.data);
  const [status, setStatus] = useState(submission.status);

  const handleSave = () => {
    onUpdate({
      ...submission,
      data: editedData,
      status,
      lastModified: new Date().toISOString(),
    });
    onClose();
  };

  const validateField = (value: any, type: string): boolean => {
    if (value === undefined || value === '') return true;

    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'number':
        return !isNaN(Number(value));
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Submission Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Form</p>
                <p className="font-medium">{submission.formName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FormSubmission['status'])}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {['pending', 'reviewed', 'approved', 'rejected'].map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Submitted At</p>
                <p>{new Date(submission.submittedAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Modified</p>
                <p>
                  {submission.lastModified
                    ? new Date(submission.lastModified).toLocaleString()
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {form.fields.map((field) => {
              const value = editedData[field.id];
              const isValid = validateField(value, field.type);

              return (
                <div key={field.id}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <div className="mt-1">
                    {field.type === 'textarea' ? (
                      <textarea
                        value={value || ''}
                        onChange={(e) =>
                          setEditedData((prev) => ({
                            ...prev,
                            [field.id]: e.target.value,
                          }))
                        }
                        className={`block w-full rounded-md shadow-sm ${
                          isValid
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        }`}
                        rows={3}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={value || ''}
                        onChange={(e) =>
                          setEditedData((prev) => ({
                            ...prev,
                            [field.id]: e.target.value,
                          }))
                        }
                        className={`block w-full rounded-md shadow-sm ${
                          isValid
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        }`}
                      >
                        <option value="">Select an option</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <input
                        type="checkbox"
                        checked={value || false}
                        onChange={(e) =>
                          setEditedData((prev) => ({
                            ...prev,
                            [field.id]: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={value || ''}
                        onChange={(e) =>
                          setEditedData((prev) => ({
                            ...prev,
                            [field.id]: e.target.value,
                          }))
                        }
                        className={`block w-full rounded-md shadow-sm ${
                          isValid
                            ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                            : 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        }`}
                      />
                    )}
                    {!isValid && (
                      <p className="mt-1 text-sm text-red-600">
                        Please enter a valid {field.type}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}; 