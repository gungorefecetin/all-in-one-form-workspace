import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'radio' | 'select';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For radio and select fields
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FormTemplate {
  id: string;
  name: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

interface FormBuilderState {
  forms: Record<string, FormTemplate>;
  activeFormId: string | null;
  isDragging: boolean;
}

const initialState: FormBuilderState = {
  forms: {},
  activeFormId: null,
  isDragging: false,
};

export const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    addForm: (state, action: PayloadAction<FormTemplate>) => {
      state.forms[action.payload.id] = action.payload;
    },
    updateForm: (state, action: PayloadAction<{ id: string; updates: Partial<FormTemplate> }>) => {
      if (state.forms[action.payload.id]) {
        state.forms[action.payload.id] = {
          ...state.forms[action.payload.id],
          ...action.payload.updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteForm: (state, action: PayloadAction<string>) => {
      delete state.forms[action.payload];
      if (state.activeFormId === action.payload) {
        state.activeFormId = null;
      }
    },
    setActiveForm: (state, action: PayloadAction<string | null>) => {
      state.activeFormId = action.payload;
    },
    addField: (state, action: PayloadAction<{ formId: string; field: FormField }>) => {
      const form = state.forms[action.payload.formId];
      if (form) {
        form.fields.push(action.payload.field);
        form.updatedAt = new Date().toISOString();
      }
    },
    updateField: (state, action: PayloadAction<{ 
      formId: string; 
      fieldId: string; 
      updates: Partial<FormField>;
    }>) => {
      const form = state.forms[action.payload.formId];
      if (form) {
        const fieldIndex = form.fields.findIndex(f => f.id === action.payload.fieldId);
        if (fieldIndex !== -1) {
          form.fields[fieldIndex] = {
            ...form.fields[fieldIndex],
            ...action.payload.updates,
          };
          form.updatedAt = new Date().toISOString();
        }
      }
    },
    deleteField: (state, action: PayloadAction<{ formId: string; fieldId: string }>) => {
      const form = state.forms[action.payload.formId];
      if (form) {
        form.fields = form.fields.filter(f => f.id !== action.payload.fieldId);
        form.updatedAt = new Date().toISOString();
      }
    },
    reorderFields: (state, action: PayloadAction<{ 
      formId: string; 
      sourceIndex: number;
      destinationIndex: number;
    }>) => {
      const form = state.forms[action.payload.formId];
      if (form) {
        const [removed] = form.fields.splice(action.payload.sourceIndex, 1);
        form.fields.splice(action.payload.destinationIndex, 0, removed);
        form.updatedAt = new Date().toISOString();
      }
    },
    setIsDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload;
    },
  },
});

export const {
  addForm,
  updateForm,
  deleteForm,
  setActiveForm,
  addField,
  updateField,
  deleteField,
  reorderFields,
  setIsDragging,
} = formBuilderSlice.actions;

export default formBuilderSlice.reducer; 