'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FormField } from '@/app/features/formBuilder/formBuilderSlice';
import { X } from 'lucide-react';

interface FieldEditorProps {
  isOpen: boolean;
  onClose: () => void;
  field: FormField;
  onSave: (field: FormField) => void;
}

export function FieldEditor({ isOpen, onClose, field, onSave }: FieldEditorProps) {
  const [editedField, setEditedField] = useState<FormField>(field);
  const [options, setOptions] = useState<string>(
    field.options?.join('\n') || ''
  );

  useEffect(() => {
    setEditedField(field);
    setOptions(field.options?.join('\n') || '');
  }, [field]);

  const handleSave = () => {
    const updatedField = {
      ...editedField,
      options:
        editedField.type === 'radio' || editedField.type === 'select'
          ? options
              .split('\n')
              .map((opt) => opt.trim())
              .filter(Boolean)
          : undefined,
    };
    onSave(updatedField);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    Edit Field
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={editedField.label}
                      onChange={(e) =>
                        setEditedField({ ...editedField, label: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={editedField.placeholder || ''}
                      onChange={(e) =>
                        setEditedField({
                          ...editedField,
                          placeholder: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {(editedField.type === 'radio' ||
                    editedField.type === 'select') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options (one per line)
                      </label>
                      <textarea
                        value={options}
                        onChange={(e) => setOptions(e.target.value)}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {editedField.type === 'number' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min Value
                          </label>
                          <input
                            type="number"
                            value={editedField.validation?.min || ''}
                            onChange={(e) =>
                              setEditedField({
                                ...editedField,
                                validation: {
                                  ...editedField.validation,
                                  min: e.target.value ? Number(e.target.value) : undefined,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Value
                          </label>
                          <input
                            type="number"
                            value={editedField.validation?.max || ''}
                            onChange={(e) =>
                              setEditedField({
                                ...editedField,
                                validation: {
                                  ...editedField.validation,
                                  max: e.target.value ? Number(e.target.value) : undefined,
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="required"
                      checked={editedField.required}
                      onChange={(e) =>
                        setEditedField({
                          ...editedField,
                          required: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="required"
                      className="ml-2 text-sm font-medium text-gray-700"
                    >
                      Required field
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Changes
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 