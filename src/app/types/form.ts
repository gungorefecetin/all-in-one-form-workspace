export interface Form {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // For select fields
} 