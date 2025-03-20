export interface FormSubmission {
  id: string;
  formId: string;
  formName: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  submittedAt: string;
  data: Record<string, any>;
  lastModified?: string;
}

export interface SubmissionTableFilters {
  status?: string;
  search?: string;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
}

export interface SortConfig {
  id: string;
  desc: boolean;
} 