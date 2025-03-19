'use client';

import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/app/hooks/redux';
import {
  FileItem,
  updateFile,
  deleteFile,
  setCurrentFolder,
  toggleFileSelection,
  addToSelection,
  clearSelection,
  setLastSelectedFile,
  addFile
} from '@/app/features/fileManager/fileManagerSlice';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import { RenameDialog } from './RenameDialog';
import { FilePreview } from './FilePreview';
import { FileIcon } from './FileIcon';
import { SortOption, SortDirection } from './FileManager';
import { useDragAndDrop } from '@/app/hooks/useDragAndDrop';
import clsx from 'clsx';

interface FileListProps {
  searchQuery: string;
  sortBy: SortOption;
  sortDirection: SortDirection;
  viewMode: 'grid' | 'list';
}

export function FileList({ searchQuery, sortBy, sortDirection, viewMode }: FileListProps) {
  const dispatch = useAppDispatch();
  const { files, currentFolder, selectedFiles, movingFiles = [], isLoading } = useAppSelector((state) => state.fileManager);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [activeFile, setActiveFile] = useState<FileItem | null>(null);

  const { drop: rootDrop, isOver: rootIsOver, canDrop: rootCanDrop } = useDragAndDrop(currentFolder, true);

  const rootDropRef = useCallback((node: HTMLDivElement | null) => {
    rootDrop(node);
  }, [rootDrop]);

  const sortFiles = (items: FileItem[]) => {
    return [...items].sort((a, b) => {
      // Always show folders first
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      const multiplier = sortDirection === 'asc' ? 1 : -1;

      switch (sortBy) {
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'date':
          return multiplier * (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        case 'type':
          return multiplier * a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  };

  const filteredFiles = Object.values(files).filter((file) => {
    const matchesParent = file.parentId === currentFolder;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesParent && (searchQuery === '' || matchesSearch);
  });

  const sortedFiles = sortFiles(filteredFiles);

  const handleClick = useCallback((file: FileItem, event: React.MouseEvent) => {
    if (file.type === 'folder') {
      dispatch(setCurrentFolder(file.id));
      return;
    }

    // Handle selection
    if (event.ctrlKey || event.metaKey) {
      dispatch(toggleFileSelection(file.id));
    } else if (event.shiftKey) {
      // Find the range of files to select
      const fileIds = sortedFiles.map(f => f.id);
      const lastSelectedIndex = fileIds.indexOf(selectedFiles[selectedFiles.length - 1]);
      const currentIndex = fileIds.indexOf(file.id);
      
      if (lastSelectedIndex !== -1) {
        const start = Math.min(lastSelectedIndex, currentIndex);
        const end = Math.max(lastSelectedIndex, currentIndex);
        const rangeToSelect = fileIds.slice(start, end + 1);
        dispatch(addToSelection(rangeToSelect));
      } else {
        dispatch(toggleFileSelection(file.id));
      }
    } else {
      // Regular click
      if (selectedFiles.length === 1 && selectedFiles[0] === file.id) {
        setActiveFile(file);
        setIsPreviewing(true);
      } else {
        dispatch(clearSelection());
        dispatch(toggleFileSelection(file.id));
      }
    }
  }, [dispatch, selectedFiles, sortedFiles]);

  const handleRename = (newName: string) => {
    if (activeFile) {
      dispatch(updateFile({ id: activeFile.id, updates: { name: newName } }));
    }
  };

  const handleDelete = (fileId: string) => {
    dispatch(deleteFile(fileId));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Required for drop to work
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Handle files dropped from outside the browser
    if (e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      files.forEach(file => {
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
      });
    }
  };

  const FileListItem = ({ file }: { file: FileItem }) => {
    const { drag, drop, isDragging, isOver, canDrop } = useDragAndDrop(file.id, file.type === 'folder');
    const isMoving = movingFiles.includes(file.id);
    
    const itemRef = useCallback((node: HTMLDivElement | null) => {
      drag(node);
      if (file.type === 'folder') {
        drop(node);
      }
    }, [drag, drop, file.type]);

    const handleItemDragStart = (e: React.DragEvent<HTMLDivElement>) => {
      // Prevent native drag for files that should open in new tab
      if (file.type === 'file') {
        e.preventDefault();
      }
    };

    const handleItemClick = (e: React.MouseEvent) => {
      if (file.type === 'file') {
        // Always preview on direct click
        if (!isDragging && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
          setActiveFile(file);
          setIsPreviewing(true);
          return;
        }
      }
      handleClick(file, e);
    };

    return (
      <div
        ref={itemRef}
        onClick={handleItemClick}
        onDragStart={handleItemDragStart}
        className={clsx(
          viewMode === 'grid' ? 
            'group flex flex-col p-2 rounded-lg border hover:bg-gray-50 cursor-pointer w-full max-w-[200px]' :
            'group flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer',
          selectedFiles.includes(file.id) ? 'bg-blue-50 border-blue-200' : 'border-gray-200',
          isDragging && 'opacity-50',
          file.type === 'folder' && isOver && canDrop && 'ring-2 ring-blue-500 bg-blue-50',
          file.type === 'folder' && isOver && !canDrop && 'ring-2 ring-red-500',
          isMoving && 'opacity-50'
        )}
        style={{ opacity: isDragging || isMoving ? 0.5 : 1 }}
      >
        <div className={clsx(
          "flex min-w-0",
          viewMode === 'grid' ? 'flex-col items-center mb-2' : 'flex-row items-center flex-1'
        )}>
          <div className="relative">
            <FileIcon 
              type={file.type} 
              filename={file.name} 
              className={clsx(
                viewMode === 'grid' ? 'w-12 h-12 mb-2' : 'w-6 h-6 mr-3'
              )} 
            />
            {isMoving && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              </div>
            )}
          </div>
          <div className={clsx(
            "flex flex-col min-w-0",
            viewMode === 'grid' ? 'text-center w-full' : ''
          )}>
            <span className="font-medium text-sm truncate">{file.name}</span>
            {viewMode === 'list' && (
              <span className="text-xs text-gray-500">
                {new Date(file.updatedAt).toLocaleDateString()}
                {file.size && ` • ${(file.size / 1024).toFixed(1)} KB`}
              </span>
            )}
          </div>
        </div>

        <Menu as="div" className={clsx(
          "relative",
          viewMode === 'grid' ? 'self-end' : ''
        )}>
          <Menu.Button 
            onClick={(e) => e.stopPropagation()} 
            className="invisible group-hover:visible p-1 rounded-full hover:bg-gray-200"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </Menu.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Menu.Items 
              className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {file.type === 'file' && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFile(file);
                        setIsPreviewing(true);
                      }}
                      className={`${
                        active ? 'bg-gray-100' : ''
                      } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </button>
                  )}
                </Menu.Item>
              )}
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFile(file);
                      setIsRenaming(true);
                    }}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Rename
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.id);
                    }}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex w-full items-center px-4 py-2 text-sm text-red-600`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    );
  };

  if (sortedFiles.length === 0) {
    return (
      <div
        ref={rootDropRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={clsx(
          "flex flex-col items-center justify-center min-h-[400px]",
          rootIsOver && rootCanDrop && "bg-blue-50 ring-2 ring-blue-500 rounded-lg",
          rootIsOver && !rootCanDrop && "bg-red-50 ring-2 ring-red-500 rounded-lg",
          "transition-colors duration-200"
        )}
      >
        <FileIcon type="folder" className="w-16 h-16 mb-4 text-gray-500" />
        <p className="text-gray-500">{searchQuery ? 'No matching files or folders' : 'No files or folders yet'}</p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={rootDropRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={clsx(
          viewMode === 'grid' ? 
            "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4" : 
            "flex flex-col divide-y divide-gray-200",
          "min-h-[400px]",
          rootIsOver && rootCanDrop && "bg-blue-50 ring-2 ring-blue-500 rounded-lg",
          rootIsOver && !rootCanDrop && "bg-red-50 ring-2 ring-red-500 rounded-lg",
          "transition-colors duration-200"
        )}
      >
        {sortedFiles.map((file) => (
          <FileListItem key={file.id} file={file} />
        ))}
      </div>

      {activeFile && (
        <>
          <RenameDialog
            isOpen={isRenaming}
            onClose={() => {
              setIsRenaming(false);
              setActiveFile(null);
            }}
            onRename={handleRename}
            item={activeFile}
          />

          {activeFile.type === 'file' && (
            <FilePreview
              isOpen={isPreviewing}
              onClose={() => {
                setIsPreviewing(false);
                setActiveFile(null);
              }}
              file={activeFile}
            />
          )}
        </>
      )}
    </>
  );
} 