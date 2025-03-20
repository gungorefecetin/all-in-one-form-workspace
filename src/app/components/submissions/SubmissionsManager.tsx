"use client";

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { FormSubmission } from '@/app/types/submissions';
import { useFormSubmissions } from '@/app/hooks/useFormSubmissions';
import { useForms } from '@/app/hooks/useForms';
import { Form, FormField } from '@/app/types/form';
import { SubmissionDetails } from './SubmissionDetails';

interface Props {
  formId?: string;
}

const SubmissionsManager: React.FC<Props> = ({ formId: propFormId }) => {
  const [selectedFormId, setSelectedFormId] = useState<string | undefined>(propFormId);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [editingCell, setEditingCell] = useState<{
    rowId: string;
    columnId: string;
    value: any;
    fieldType?: FormField['type'];
  } | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  const { submissions, updateSubmission, deleteSubmission, exportToCSV } = useFormSubmissions(selectedFormId);
  const { forms } = useForms();
  const selectedForm = forms.find(f => f.id === selectedFormId);

  const validateField = (value: any, fieldType: FormField['type']): { isValid: boolean; message?: string } => {
    if (value === '' || value === undefined) {
      return { isValid: true };
    }

    switch (fieldType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: emailRegex.test(value),
          message: 'Please enter a valid email address',
        };
      case 'number':
        return {
          isValid: !isNaN(Number(value)),
          message: 'Please enter a valid number',
        };
      default:
        return { isValid: true };
    }
  };

  const handleCellEdit = (info: any, value: any, fieldType?: FormField['type']) => {
    if (fieldType) {
      const validation = validateField(value, fieldType);
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }
    }

    const updatedSubmission = {
      ...info.row.original,
      [info.column.id]: value,
      lastModified: new Date().toISOString(),
    };
    updateSubmission(updatedSubmission);
    setEditingCell(null);
  };

  const renderEditableCell = (info: any, type: FormField['type'], options?: string[]) => {
    const value = info.getValue();
    const rowId = info.row.id;
    const columnId = info.column.id;
    const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === columnId;

    if (isEditing) {
      switch (type) {
        case 'select':
          return (
            <select
              value={editingCell?.value ?? value}
              onChange={(e) => handleCellEdit(info, e.target.value, type)}
              className="w-full p-1 border rounded"
              autoFocus
              onBlur={() => setEditingCell(null)}
            >
              {options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        case 'checkbox':
          return (
            <input
              type="checkbox"
              checked={editingCell?.value ?? value}
              onChange={(e) => handleCellEdit(info, e.target.checked, type)}
              className="w-4 h-4"
              autoFocus
              onBlur={() => setEditingCell(null)}
            />
          );
        case 'textarea':
          return (
            <textarea
              value={editingCell?.value ?? value}
              onChange={(e) => handleCellEdit(info, e.target.value, type)}
              className="w-full p-1 border rounded"
              autoFocus
              onBlur={() => setEditingCell(null)}
            />
          );
        default:
          return (
            <input
              type={type}
              value={editingCell?.value ?? value}
              onChange={(e) => handleCellEdit(info, e.target.value, type)}
              className="w-full p-1 border rounded"
              autoFocus
              onBlur={() => setEditingCell(null)}
            />
          );
      }
    }

    return (
      <span
        onClick={() => setEditingCell({ rowId, columnId, value, fieldType: type })}
        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
      >
        {type === 'checkbox' ? (
          <input type="checkbox" checked={value} readOnly className="w-4 h-4" />
        ) : (
          value
        )}
      </span>
    );
  };

  const baseColumns = useMemo<ColumnDef<FormSubmission>[]>(
    () => [
      {
        accessorKey: 'formName',
        header: 'Form Name',
        cell: (info) => renderEditableCell(info, 'text'),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const value = info.getValue() as string;
          const rowId = info.row.id;
          const columnId = 'status';
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === columnId;

          if (isEditing) {
            return (
              <select
                value={editingCell?.value ?? value}
                onChange={(e) => {
                  handleCellEdit(info, e.target.value as FormSubmission['status']);
                }}
                className="w-full p-1 border rounded"
                autoFocus
                onBlur={() => setEditingCell(null)}
              >
                {['pending', 'reviewed', 'approved', 'rejected'].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            );
          }

          return (
            <span
              onClick={() =>
                setEditingCell({ rowId, columnId, value })
              }
              className={`px-2 py-1 rounded-full text-xs cursor-pointer ${
                {
                  pending: 'bg-yellow-100 text-yellow-800',
                  reviewed: 'bg-blue-100 text-blue-800',
                  approved: 'bg-green-100 text-green-800',
                  rejected: 'bg-red-100 text-red-800',
                }[value]
              }`}
            >
              {value}
            </span>
          );
        },
      },
      {
        accessorKey: 'submittedAt',
        header: 'Submitted',
        cell: (info) => new Date(info.getValue() as string).toLocaleString(),
      },
      {
        accessorKey: 'lastModified',
        header: 'Last Modified',
        cell: (info) => {
          const value = info.getValue() as string;
          return value ? new Date(value).toLocaleString() : '-';
        },
      },
    ],
    [editingCell]
  );

  const formFieldColumns = useMemo(() => {
    if (!selectedForm) return [];

    return selectedForm.fields.map((field): ColumnDef<FormSubmission> => ({
      accessorFn: (row) => row.data[field.id],
      id: `field_${field.id}`,
      header: field.label,
      cell: (info) => renderEditableCell(info, field.type, field.options),
    }));
  }, [selectedForm, renderEditableCell]);

  const actionColumn = useMemo<ColumnDef<FormSubmission>>(
    () => ({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedSubmission(info.row.original)}
            className="text-blue-600 hover:text-blue-800"
          >
            View Details
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this submission?')) {
                deleteSubmission(info.row.original.id);
              }
            }}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ),
    }),
    [deleteSubmission]
  );

  const columns = useMemo(
    () => [...baseColumns, ...formFieldColumns, actionColumn],
    [baseColumns, formFieldColumns, actionColumn]
  );

  const table = useReactTable({
    data: submissions,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            {!propFormId && (
              <select
                value={selectedFormId || ''}
                onChange={(e) => setSelectedFormId(e.target.value || undefined)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">All Forms</option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search submissions..."
              className="px-4 py-2 border rounded-lg flex-1"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                    }`}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              {'<<'}
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              {'<'}
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              {'>'}
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              {'>>'}
            </button>
          </div>
          <span className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
        </div>
      </div>

      {selectedSubmission && selectedForm && (
        <SubmissionDetails
          submission={selectedSubmission}
          form={selectedForm}
          onClose={() => setSelectedSubmission(null)}
          onUpdate={(updatedSubmission) => {
            updateSubmission(updatedSubmission);
            setSelectedSubmission(null);
          }}
        />
      )}
    </div>
  );
};

export default SubmissionsManager; 