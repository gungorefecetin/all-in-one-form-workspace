"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import SubmissionsManager from "@/app/components/submissions/SubmissionsManager";
import { useForms } from "@/app/hooks/useForms";

export default function FormSubmissionsPage() {
  const params = useParams();
  const formId = params.formId as string;
  const { forms } = useForms();
  const form = forms.find(f => f.id === formId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/submissions"
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Back to All Submissions
          </Link>
          <h1 className="text-2xl font-bold">
            {form ? `${form.name} Submissions` : 'Loading...'}
          </h1>
        </div>
      </div>
      
      <SubmissionsManager formId={formId} />
    </div>
  );
} 