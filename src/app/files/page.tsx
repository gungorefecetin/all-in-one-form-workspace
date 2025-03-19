import { FileManager } from '@/app/components/FileManager/FileManager';

export default function FilesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FileManager />
      </div>
    </main>
  );
} 