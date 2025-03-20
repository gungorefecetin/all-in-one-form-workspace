'use client';

import { useState, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/app/hooks/redux';
import { FormField, addForm } from '@/app/features/formBuilder/formBuilderSlice';
import { addFile } from '@/app/features/fileManager/fileManagerSlice';
import { FieldPalette } from '@/app/components/FormBuilder/FieldPalette';
import { FormField as FormFieldComponent } from '@/app/components/FormBuilder/FormField';
import { FieldEditor } from '@/app/components/FormBuilder/FieldEditor';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Save, Eye, FileText } from 'lucide-react';
import { FormPreview } from '@/app/components/FormBuilder/FormPreview';

interface DropAreaProps {
  children: React.ReactNode;
  className: string;
  onDrop: (item: any, monitor: any) => void;
}

const DropArea = forwardRef<HTMLDivElement, DropAreaProps>(
  function DropArea({ children, className, onDrop }, ref) {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: ['NEW_FIELD', 'FORM_FIELD'],
      drop: onDrop,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    return (
      <div
        ref={(node) => {
          drop(node);
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={`${className} ${
          isOver ? 'border-blue-500 border-dashed' : 'border-gray-200'
        }`}
      >
        {children}
      </div>
    );
  }
);

export default function FormBuilderPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDrop = (item: any, monitor: any) => {
    if (monitor.getItemType() === 'NEW_FIELD') {
      const newField: FormField = {
        id: uuidv4(),
        type: item.type,
        label: `New ${item.type} field`,
        required: false,
        placeholder: '',
      };
      setFields((prev) => [...prev, newField]);
    } else if (monitor.getItemType() === 'FORM_FIELD' && item?.id) {
      const dragIndex = fields.findIndex(f => f.id === item.id);
      if (dragIndex === -1) return;

      const hoverIndex = fields.length;
      if (dragIndex === hoverIndex) return;

      const updatedFields = [...fields];
      const [removed] = updatedFields.splice(dragIndex, 1);
      updatedFields.splice(hoverIndex, 0, removed);
      setFields(updatedFields);
    }
  };

  const handleSave = () => {
    if (!formName.trim()) {
      alert('Please enter a form name');
      return;
    }

    const formId = uuidv4();
    const newForm = {
      id: formId,
      name: formName,
      fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to form builder state
    dispatch(addForm(newForm));

    // Save to file system
    dispatch(addFile({
      id: formId,
      name: formName,
      type: 'form',
      parentId: null, // Save to root directory
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formData: newForm,
    }));

    router.push('/files');
  };

  const handleDeleteField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const handleEditField = (id: string) => {
    const field = fields.find((f) => f.id === id);
    if (field) {
      setEditingField(field);
    }
  };

  const handleUpdateField = (updatedField: FormField) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === updatedField.id ? updatedField : field
      )
    );
    setEditingField(null);
  };

  const moveField = (dragIndex: number, hoverIndex: number) => {
    if (!fields || dragIndex < 0 || hoverIndex < 0) return;
    
    const updatedFields = [...fields];
    if (dragIndex >= 0 && dragIndex < updatedFields.length && 
        hoverIndex >= 0 && hoverIndex < updatedFields.length) {
      const [removed] = updatedFields.splice(dragIndex, 1);
      updatedFields.splice(hoverIndex, 0, removed);
      setFields(updatedFields);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push('/')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white"
                title="Back to Main Page"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push('/forms')}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white"
                title="Back to Forms List"
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter form name"
              className="text-2xl font-semibold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Form
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-9">
            <DropArea
              className="bg-white rounded-lg border-2 min-h-[500px] p-6"
              onDrop={handleDrop}
            >
              {!fields || fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p className="text-lg mb-2">Drag and drop form elements here</p>
                  <p className="text-sm">or click an element to add it to the form</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    field && field.id ? (
                      <FormFieldComponent
                        key={field.id}
                        field={field}
                        index={index}
                        onDelete={handleDeleteField}
                        onEdit={handleEditField}
                        moveField={moveField}
                      />
                    ) : null
                  ))}
                </div>
              )}
            </DropArea>
          </div>
          <div className="col-span-3">
            <FieldPalette />
          </div>
        </div>
      </div>

      {editingField && (
        <FieldEditor
          isOpen={!!editingField}
          onClose={() => setEditingField(null)}
          field={editingField}
          onSave={handleUpdateField}
        />
      )}

      <FormPreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        form={{
          id: 'preview',
          name: formName || 'Form Preview',
          fields: fields || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
      />
    </main>
  );
} 