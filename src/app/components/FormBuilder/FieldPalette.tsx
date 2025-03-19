'use client';

import { useDrag } from 'react-dnd';
import {
  Type,
  AlignLeft,
  Hash,
  CheckSquare,
  List,
  ListChecks,
} from 'lucide-react';
import { forwardRef } from 'react';

interface FieldTypeItem {
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'radio' | 'select';
  label: string;
  icon: React.ReactNode;
}

const fieldTypes: FieldTypeItem[] = [
  { type: 'text', label: 'Text Input', icon: <Type /> },
  { type: 'textarea', label: 'Text Area', icon: <AlignLeft /> },
  { type: 'number', label: 'Number', icon: <Hash /> },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare /> },
  { type: 'radio', label: 'Radio Group', icon: <ListChecks /> },
  { type: 'select', label: 'Dropdown', icon: <List /> },
];

interface DraggableFieldTypeProps {
  type: FieldTypeItem;
}

const DraggableFieldType = forwardRef<HTMLDivElement, DraggableFieldTypeProps>(
  function DraggableFieldType({ type }, ref) {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'NEW_FIELD',
      item: { type: type.type },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    return (
      <div
        ref={(node) => {
          drag(node);
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={`flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-move hover:border-blue-500 hover:shadow-sm transition-all duration-200 ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <div className="text-gray-400 mr-3">{type.icon}</div>
        <span className="text-sm font-medium text-gray-700">{type.label}</span>
      </div>
    );
  }
);

export function FieldPalette() {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Form Elements</h3>
      <div className="space-y-2">
        {fieldTypes.map((type) => (
          <DraggableFieldType key={type.type} type={type} />
        ))}
      </div>
    </div>
  );
} 