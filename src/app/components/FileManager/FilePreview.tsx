'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FileItem } from '@/app/features/fileManager/fileManagerSlice';
import { X, Download } from 'lucide-react';
import { FileIcon } from './FileIcon';

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
  const fileType = getFileType(file.name);

  const handleDownload = () => {
    if (!file.content) return;
    
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderContent = () => {
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {file.name}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2">
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