'use client';

import { ChevronRight, Home } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/app/hooks/redux';
import { setCurrentFolder } from '@/app/features/fileManager/fileManagerSlice';
import Link from 'next/link';

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export function Breadcrumbs() {
  const dispatch = useAppDispatch();
  const { files, currentFolder } = useAppSelector((state) => state.fileManager);

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];
    let current = currentFolder;

    while (current && files[current]) {
      breadcrumbs.unshift({
        id: current,
        name: files[current].name,
      });
      current = files[current].parentId;
    }

    // Always add "My Files" after Home
    breadcrumbs.unshift({ id: null, name: 'My Files' });

    return breadcrumbs;
  };

  const handleClick = (folderId: string | null) => {
    dispatch(setCurrentFolder(folderId));
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link
        href="/"
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <Home className="w-4 h-4" />
      </Link>
      {breadcrumbs.map((item, index) => (
        <div key={item.id ?? 'root'} className="flex items-center">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => handleClick(item.id)}
            className={`px-2 py-1 rounded hover:bg-gray-100 ${
              index === breadcrumbs.length - 1
                ? 'font-medium text-gray-900'
                : 'text-gray-600'
            }`}
          >
            {item.name}
          </button>
        </div>
      ))}
    </nav>
  );
} 