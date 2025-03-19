'use client';

import { forwardRef } from 'react';
import { useAppDispatch } from '@/app/hooks/redux';
import { addFile } from '@/app/features/fileManager/fileManagerSlice';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  currentFolder: string | null;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ currentFolder }, ref) => {
    const dispatch = useAppDispatch();

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      for (const file of Array.from(files)) {
        // For now, we'll store the file in memory
        // In a real app, we'd upload to Supabase storage
        const reader = new FileReader();
        reader.onload = () => {
          const newFile = {
            id: crypto.randomUUID(),
            name: file.name,
            type: 'file' as const,
            parentId: currentFolder,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            size: file.size,
            content: reader.result as string,
          };
          dispatch(addFile(newFile));
        };
        reader.readAsDataURL(file);
      }

      // Reset the input
      if (event.target) {
        event.target.value = '';
      }
    };

    return (
      <>
        <input
          type="file"
          ref={ref}
          onChange={handleUpload}
          className="hidden"
          multiple
        />
        <button
          onClick={() => (ref as React.RefObject<HTMLInputElement>).current?.click()}
          className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          title="Upload Files (Ctrl+U)"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </button>
      </>
    );
  }
); 