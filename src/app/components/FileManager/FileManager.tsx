'use client';

import { useState, useRef, Fragment, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import { FileList } from './FileList';
import { FileUpload } from './FileUpload';
import { Breadcrumbs } from './Breadcrumbs';
import { useKeyboardShortcuts } from '@/app/hooks/useKeyboardShortcuts';
import { 
  FolderPlus, 
  Upload, 
  Trash2, 
  ChevronLeft,
  Search,
  ArrowUpDown,
  Keyboard,
  LayoutGrid,
  List
} from 'lucide-react';
import { Menu, Transition, Dialog } from '@headlessui/react';
import { 
  addFile, 
  setCurrentFolder,
  deleteFile,
  FileItem,
  setViewMode
} from '@/app/features/fileManager/fileManagerSlice';
import { RenameDialog } from './RenameDialog';

export type SortOption = 'name' | 'date' | 'type';
export type SortDirection = 'asc' | 'desc';

export function FileManager() {
  const dispatch = useAppDispatch();
  const { currentFolder, files, viewMode } = useAppSelector((state) => state.fileManager);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamingItem, setRenamingItem] = useState<FileItem | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedViewMode = localStorage.getItem('viewMode') as 'grid' | 'list' || 'grid';
    dispatch(setViewMode(savedViewMode));
  }, [dispatch]);

  const handleCreateFolder = () => {
    const newFolder = {
      id: crypto.randomUUID(),
      name: '',
      type: 'folder' as const,
      parentId: currentFolder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRenamingItem(newFolder);
    setIsRenaming(true);
  };

  const handleRename = (newName: string) => {
    if (renamingItem) {
      dispatch(addFile({ ...renamingItem, name: newName }));
      setRenamingItem(null);
    }
  };

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  const handleSearch = () => {
    searchInputRef.current?.focus();
  };

  const handleUploadFiles = () => {
    fileInputRef.current?.click();
  };

  const toggleViewMode = useCallback(() => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    dispatch(setViewMode(newMode));
    localStorage.setItem('viewMode', newMode);
  }, [viewMode, dispatch]);

  useKeyboardShortcuts({
    onCreateFolder: handleCreateFolder,
    onUploadFiles: handleUploadFiles,
    onSearch: handleSearch,
  });

  const handleNavigateBack = () => {
    if (currentFolder && files[currentFolder]) {
      dispatch(setCurrentFolder(files[currentFolder].parentId));
    }
  };

  const getCurrentFolderName = () => {
    if (!currentFolder) return 'My Files';
    return files[currentFolder]?.name || 'Current Folder';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-4 py-3">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <Breadcrumbs />
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search files... (Ctrl+F)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <button
                  onClick={toggleViewMode}
                  className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {viewMode === 'grid' ? (
                    <List className="w-5 h-5" />
                  ) : (
                    <LayoutGrid className="w-5 h-5" />
                  )}
                </button>
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Sort by
                  </Menu.Button>
                  <Transition
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleSort('name')}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleSort('date')}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleSort('type')}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            Type {sortBy === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
                <button
                  onClick={handleCreateFolder}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  title="New Folder (Ctrl+N)"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </button>
                <FileUpload currentFolder={currentFolder} ref={fileInputRef} />
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  title="Keyboard Shortcuts"
                >
                  <Keyboard className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-50">
        <FileList 
          searchQuery={searchQuery}
          sortBy={sortBy}
          sortDirection={sortDirection}
          viewMode={viewMode}
        />
      </div>

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={isRenaming}
        onClose={() => {
          setIsRenaming(false);
          setRenamingItem(null);
        }}
        onRename={handleRename}
        item={renamingItem || { id: '', name: '', type: 'folder', parentId: null, createdAt: '', updatedAt: '' }}
        isNewItem={!!renamingItem}
      />

      {/* Keyboard Shortcuts Dialog */}
      <Transition show={showShortcuts} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowShortcuts(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-semibold leading-6 text-gray-900 mb-6">
                    Keyboard Shortcuts
                  </Dialog.Title>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Create New Folder</span>
                      <kbd className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg text-gray-800 font-mono">
                        Ctrl + N
                      </kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Upload Files</span>
                      <kbd className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg text-gray-800 font-mono">
                        Ctrl + U
                      </kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Search</span>
                      <kbd className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg text-gray-800 font-mono">
                        Ctrl + F
                      </kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Delete Selected</span>
                      <kbd className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg text-gray-800 font-mono">
                        Delete
                      </kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Clear Selection</span>
                      <kbd className="px-3 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded-lg text-gray-800 font-mono">
                        Esc
                      </kbd>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowShortcuts(false)}
                    className="mt-8 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Close
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
} 