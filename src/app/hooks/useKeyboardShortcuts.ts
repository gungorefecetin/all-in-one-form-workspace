import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import { deleteFile } from '@/app/features/fileManager/fileManagerSlice';

interface UseKeyboardShortcutsProps {
  onCreateFolder: () => void;
  onUploadFiles: () => void;
  onSearch: () => void;
}

export function useKeyboardShortcuts({
  onCreateFolder,
  onUploadFiles,
  onSearch,
}: UseKeyboardShortcutsProps) {
  const dispatch = useAppDispatch();
  const { selectedFiles } = useAppSelector((state) => state.fileManager);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Command/Ctrl + key shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            onCreateFolder();
            break;
          case 'u':
            e.preventDefault();
            onUploadFiles();
            break;
          case 'f':
            e.preventDefault();
            onSearch();
            break;
        }
      }

      // Delete key for selected files
      if (e.key === 'Delete' && selectedFiles.length > 0) {
        e.preventDefault();
        selectedFiles.forEach((fileId) => {
          dispatch(deleteFile(fileId));
        });
      }

      // Escape key to clear selection
      if (e.key === 'Escape') {
        // You might want to add a clearSelection action to your Redux store
        // dispatch(clearSelection());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, onCreateFolder, onUploadFiles, onSearch, selectedFiles]);
} 