import { useState, useEffect } from 'react';
import { FormSubmission } from '@/app/types/submissions';

const STORAGE_KEY = 'form_submissions';

export const useFormSubmissions = (formId?: string) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);

  useEffect(() => {
    const storedSubmissions = localStorage.getItem(STORAGE_KEY);
    if (storedSubmissions) {
      const parsedSubmissions = JSON.parse(storedSubmissions);
      if (formId) {
        setSubmissions(parsedSubmissions.filter((s: FormSubmission) => s.formId === formId));
      } else {
        setSubmissions(parsedSubmissions);
      }
    }
  }, [formId]);

  const updateSubmission = (updatedSubmission: FormSubmission) => {
    const newSubmissions = submissions.map((s) =>
      s.id === updatedSubmission.id ? updatedSubmission : s
    );
    setSubmissions(newSubmissions);
    const allSubmissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedAllSubmissions = allSubmissions.map((s: FormSubmission) =>
      s.id === updatedSubmission.id ? updatedSubmission : s
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAllSubmissions));
  };

  const deleteSubmission = (submissionId: string) => {
    const newSubmissions = submissions.filter((s) => s.id !== submissionId);
    setSubmissions(newSubmissions);
    const allSubmissions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updatedAllSubmissions = allSubmissions.filter(
      (s: FormSubmission) => s.id !== submissionId
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAllSubmissions));
  };

  const exportToCSV = () => {
    const headers = ['Form Name', 'Status', 'Submitted At', 'Last Modified'];
    const dataFields = submissions[0]?.data ? Object.keys(submissions[0].data) : [];
    const allHeaders = [...headers, ...dataFields];

    const csvContent = [
      allHeaders.join(','),
      ...submissions.map((submission) => {
        const baseData = [
          submission.formName,
          submission.status,
          submission.submittedAt,
          submission.lastModified || '',
        ];
        const formData = dataFields.map((field) => submission.data[field] || '');
        return [...baseData, ...formData].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `form-submissions-${new Date().toISOString()}.csv`;
    link.click();
  };

  return {
    submissions,
    updateSubmission,
    deleteSubmission,
    exportToCSV,
  };
}; 