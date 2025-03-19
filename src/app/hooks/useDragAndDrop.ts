import { useDrag, useDrop } from 'react-dnd';
import { useAppDispatch, useAppSelector } from './redux';
import { moveFiles, setIsDragging } from '@/app/features/fileManager/fileManagerSlice';

export const ItemTypes = {
  FILE: 'file',
};

interface DragItem {
  id: string;
  type: string;
  selectedIds: string[];
}

export function useDragAndDrop(fileId: string | null, isDropTarget: boolean) {
  const dispatch = useAppDispatch();
  const selectedFiles = useAppSelector((state) => state.fileManager.selectedFiles);
  const files = useAppSelector((state) => state.fileManager.files);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FILE,
    item: (): DragItem => {
      dispatch(setIsDragging(true));
      // If the dragged item is part of the selection, drag all selected items
      // Otherwise, just drag the current item
      const draggedIds = fileId && selectedFiles.includes(fileId) ? selectedFiles : fileId ? [fileId] : [];
      return {
        id: fileId || '',
        type: ItemTypes.FILE,
        selectedIds: draggedIds,
      };
    },
    canDrag: () => !!fileId, // Only allow dragging if fileId is provided
    end: () => {
      dispatch(setIsDragging(false));
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [fileId, selectedFiles]);

  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>(() => ({
    accept: ItemTypes.FILE,
    canDrop: (item: DragItem) => {
      if (!isDropTarget) return false;
      
      // Can't drop on itself
      if (item.selectedIds.includes(fileId || '')) return false;

      // Can't drop in the same folder
      const sourceFile = files[item.id];
      if (sourceFile && sourceFile.parentId === fileId) return false;

      // Check for circular dependency
      const isCircular = (sourceId: string, targetId: string | null): boolean => {
        let current = targetId;
        while (current) {
          if (current === sourceId) return true;
          current = files[current]?.parentId || null;
        }
        return false;
      };

      // Check if any of the dragged items would create a circular dependency
      return !item.selectedIds.some(id => isCircular(id, fileId));
    },
    drop: (item: DragItem) => {
      dispatch(moveFiles({
        fileIds: item.selectedIds,
        targetFolderId: fileId,
      }));
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [fileId, files]);

  return {
    drag,
    drop,
    isDragging,
    isOver,
    canDrop,
  };
} 