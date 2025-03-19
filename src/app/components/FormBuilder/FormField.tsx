'use client';

import { useDrag, useDrop } from 'react-dnd';
import { FormField as FormFieldType } from '@/app/features/formBuilder/formBuilderSlice';
import { Grip, Trash2, Settings } from 'lucide-react';
import { useState, forwardRef, useRef } from 'react';

interface FormFieldProps {
  field: FormFieldType;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  id: string;
  index: number;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  function FormField({ field, onDelete, onEdit, index, moveField }, ref) {
    const elementRef = useRef<HTMLDivElement>(null);
    const previewRef = (node: HTMLDivElement | null) => {
      elementRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
      type: 'FORM_FIELD',
      item: { id: field.id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const [, drop] = useDrop<DragItem>({
      accept: 'FORM_FIELD',
      hover: (item, monitor) => {
        if (!elementRef.current) {
          return;
        }

        const dragIndex = item.index;
        const hoverIndex = index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return;
        }

        // Get the rectangle of the current item
        const hoverBoundingRect = elementRef.current.getBoundingClientRect();

        // Get the middle of the item
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Get the mouse position
        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) {
          return;
        }

        // Get the pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }

        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }

        // Time to actually perform the action
        moveField(dragIndex, hoverIndex);

        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        item.index = hoverIndex;
      },
    });

    const [isHovered, setIsHovered] = useState(false);

    const renderFieldPreview = () => {
      switch (field.type) {
        case 'text':
          return (
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              placeholder={field.placeholder || field.label}
              disabled
            />
          );
        case 'textarea':
          return (
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 resize-none"
              placeholder={field.placeholder || field.label}
              disabled
              rows={3}
            />
          );
        case 'number':
          return (
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              placeholder={field.placeholder || field.label}
              disabled
            />
          );
        case 'checkbox':
          return (
            <div className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled
              />
              <span className="ml-2 text-gray-700">{field.label}</span>
            </div>
          );
        case 'radio':
          return (
            <div className="space-y-2">
              {field.options?.map((option, i) => (
                <div key={i} className="flex items-center">
                  <input
                    type="radio"
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled
                  />
                  <span className="ml-2 text-gray-700">{option}</span>
                </div>
              ))}
            </div>
          );
        case 'select':
          return (
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            >
              <option value="">{field.placeholder || 'Select an option'}</option>
              {field.options?.map((option, i) => (
                <option key={i} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        default:
          return null;
      }
    };

    return (
      <div
        ref={(node) => {
          drag(drop(node));
          previewRef(node);
        }}
        className={`relative bg-white rounded-lg border ${
          isDragging ? 'opacity-50' : ''
        } ${
          isHovered ? 'border-blue-500 shadow-sm' : 'border-gray-200'
        } p-4 cursor-move transition-all duration-200`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Grip className="w-4 h-4 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(field.id);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(field.id);
              }}
              className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {renderFieldPreview()}
      </div>
    );
  }
); 