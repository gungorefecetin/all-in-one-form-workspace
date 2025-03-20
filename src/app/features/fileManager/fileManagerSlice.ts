import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FormTemplate } from '@/app/features/formBuilder/formBuilderSlice';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'form';
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  size?: number;
  content?: string;
  formData?: FormTemplate; // For form type items
}

interface FileManagerState {
  files: Record<string, FileItem>;
  currentFolder: string | null;
  selectedFiles: string[];
  isLoading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  lastSelectedFile: string | null; // For shift+click selection
  isDragging: boolean;
  movingFiles: string[];
}

const initialState: FileManagerState = {
  files: {},
  currentFolder: null,
  selectedFiles: [],
  isLoading: false,
  error: null,
  viewMode: 'grid',
  lastSelectedFile: null,
  isDragging: false,
  movingFiles: [],
};

const fileManagerSlice = createSlice({
  name: 'fileManager',
  initialState,
  reducers: {
    setCurrentFolder: (state, action: PayloadAction<string | null>) => {
      state.currentFolder = action.payload;
      // Clear selection when changing folders
      state.selectedFiles = [];
      state.lastSelectedFile = null;
    },
    addFile: (state, action: PayloadAction<FileItem>) => {
      state.files[action.payload.id] = action.payload;
    },
    updateFile: (state, action: PayloadAction<{ id: string; updates: Partial<FileItem> }>) => {
      const { id, updates } = action.payload;
      if (state.files[id]) {
        state.files[id] = { ...state.files[id], ...updates };
      }
    },
    deleteFile: (state, action: PayloadAction<string>) => {
      delete state.files[action.payload];
      // Remove from selection if selected
      state.selectedFiles = state.selectedFiles.filter(id => id !== action.payload);
      if (state.lastSelectedFile === action.payload) {
        state.lastSelectedFile = null;
      }
    },
    setSelectedFiles: (state, action: PayloadAction<string[]>) => {
      state.selectedFiles = action.payload;
    },
    toggleFileSelection: (state, action: PayloadAction<string>) => {
      const fileId = action.payload;
      const index = state.selectedFiles.indexOf(fileId);
      if (index === -1) {
        state.selectedFiles.push(fileId);
      } else {
        state.selectedFiles.splice(index, 1);
      }
      state.lastSelectedFile = fileId;
    },
    addToSelection: (state, action: PayloadAction<string[]>) => {
      const newSelection = [...new Set([...state.selectedFiles, ...action.payload])];
      state.selectedFiles = newSelection;
    },
    clearSelection: (state) => {
      state.selectedFiles = [];
      state.lastSelectedFile = null;
    },
    setLastSelectedFile: (state, action: PayloadAction<string | null>) => {
      state.lastSelectedFile = action.payload;
    },
    setViewMode: (state, action: PayloadAction<'grid' | 'list'>) => {
      state.viewMode = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    startMovingFiles: (state, action: PayloadAction<string[]>) => {
      state.movingFiles = action.payload;
      state.isLoading = true;
    },
    finishMovingFiles: (state) => {
      state.movingFiles = [];
      state.isLoading = false;
    },
    moveFiles: (state, action: PayloadAction<{ fileIds: string[]; targetFolderId: string | null }>) => {
      const { fileIds, targetFolderId } = action.payload;
      
      // Start moving files
      state.movingFiles = fileIds;
      state.isLoading = true;

      // Check if target folder exists (if not null) and is actually a folder
      if (targetFolderId && (!state.files[targetFolderId] || state.files[targetFolderId].type !== 'folder')) {
        state.isLoading = false;
        state.movingFiles = [];
        return;
      }

      // Check for circular dependency
      const isCircular = (fileId: string, targetId: string | null): boolean => {
        let current = targetId;
        while (current) {
          if (current === fileId) return true;
          current = state.files[current]?.parentId || null;
        }
        return false;
      };

      fileIds.forEach(fileId => {
        const file = state.files[fileId];
        if (file && file.parentId !== targetFolderId) {
          // Skip if trying to move a folder into itself or its descendants
          if (file.type === 'folder' && isCircular(fileId, targetFolderId)) {
            return;
          }
          
          state.files[fileId] = {
            ...file,
            parentId: targetFolderId,
            updatedAt: new Date().toISOString(),
          };
        }
      });

      // Finish moving files
      state.movingFiles = [];
      state.isLoading = false;
    },
    setIsDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },
  },
});

export const {
  setCurrentFolder,
  addFile,
  updateFile,
  deleteFile,
  setSelectedFiles,
  toggleFileSelection,
  addToSelection,
  clearSelection,
  setLastSelectedFile,
  setViewMode,
  setLoading,
  setError,
  moveFiles,
  setIsDragging,
  startMovingFiles,
  finishMovingFiles,
} = fileManagerSlice.actions;

export default fileManagerSlice.reducer; 