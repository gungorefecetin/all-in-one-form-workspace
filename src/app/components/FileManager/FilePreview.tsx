'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FileItem } from '@/app/features/fileManager/fileManagerSlice';
import { X, Download, Pencil, Copy } from 'lucide-react';
import { FileIcon } from './FileIcon';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/app/hooks/redux';
import { addFile } from '@/app/features/fileManager/fileManagerSlice';
import { v4 as uuidv4 } from 'uuid';

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem;
}

const getFileType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  // Common file types
  const fileTypes: Record<string, string> = {
    // Images
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    webp: 'image',
    svg: 'image',
    
    // Documents
    pdf: 'pdf',
    doc: 'document',
    docx: 'document',
    txt: 'text',
    rtf: 'text',
    md: 'text',
    
    // Presentations
    ppt: 'presentation',
    pptx: 'presentation',
    
    // Spreadsheets
    xls: 'spreadsheet',
    xlsx: 'spreadsheet',
    csv: 'text',
  };

  return fileTypes[extension] || 'unknown';
};

const getTextContent = (dataUrl: string): string => {
  try {
    // Remove the data URL prefix and decode base64
    const base64Content = dataUrl.split(',')[1];
    const decodedContent = atob(base64Content);
    return decodedContent;
  } catch (error) {
    return 'Unable to decode file content';
  }
};

export function FilePreview({ isOpen, onClose, file }: FilePreviewProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fileType = file.type === 'form' ? 'form' : getFileType(file.name);

  const handleDownload = () => {
    if (!file.content) return;
    
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEdit = () => {
    if (file.type === 'form' && file.formData) {
      const editUrl = `/forms/builder/${file.formData.id}`;
      console.log('Navigating to:', editUrl);
      router.push(editUrl);
      onClose();
    }
  };

  const handleDuplicate = () => {
    if (file.type === 'form' && file.formData) {
      const newId = uuidv4();
      const newForm = {
        ...file.formData,
        id: newId,
        name: `${file.formData.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dispatch(addFile({
        id: newId,
        name: `${file.name} (Copy)`,
        type: 'form',
        parentId: file.parentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        formData: newForm,
      }));

      onClose();
    }
  };

  const renderContent = () => {
    if (file.type === 'form' && file.formData) {
      return (
        <div className="p-6">
          <div className="mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Form Details</h3>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p>{new Date(file.formData.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Modified</p>
                  <p>{new Date(file.formData.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900">Form Fields</h3>
              <div className="mt-4 space-y-4">
                {file.formData.fields.map((field) => (
                  <div key={field.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{field.label}</p>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-gray-500">Type: {field.type}</p>
                          {field.placeholder && (
                            <p className="text-sm text-gray-500">
                              Placeholder: {field.placeholder}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {field.required && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    {field.options && field.options.length > 0 && (
                      <div className="mt-3 border-t pt-3">
                        <p className="text-sm text-gray-500 mb-2">Options:</p>
                        <div className="flex flex-wrap gap-2">
                          {field.options.map((option) => (
                            <span
                              key={option}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleDuplicate}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Duplicate Form
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Form
            </button>
          </div>
        </div>
      );
    }

    if (!file.content) return <div>No content available</div>;

    switch (fileType) {
      case 'image':
        return (
          <div className="flex justify-center">
            <img
              src={file.content}
              alt={file.name}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        );
      case 'pdf':
        return (
          <embed
            src={file.content}
            type="application/pdf"
            width="100%"
            height="70vh"
          />
        );
      case 'text':
        return (
          <div className="bg-gray-50 p-4 rounded-lg max-h-[70vh] overflow-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
              {getTextContent(file.content)}
            </pre>
          </div>
        );
      case 'presentation':
      case 'document':
      case 'spreadsheet':
        return (
          <div className="text-center p-8">
            <div className="mb-4">
              <FileIcon type="file" filename={file.name} className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-gray-600 mb-4">
              Preview not available for {fileType} files.
              {file.size && (
                <span className="block text-sm mt-2">
                  File size: {(file.size / 1024).toFixed(1)} KB
                </span>
              )}
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </button>
          </div>
        );
      default:
        return (
          <div className="text-center p-8 text-gray-600">
            Preview not available for this file type
          </div>
        );
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileIcon type={file.type} filename={file.name} className="w-6 h-6" />
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        {file.name}
                      </Dialog.Title>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.type !== 'form' && file.content && (
                        <button
                          onClick={handleDownload}
                          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  {renderContent()}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 