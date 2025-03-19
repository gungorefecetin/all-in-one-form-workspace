import { Home } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      title: 'File Manager',
      description: 'Organize form-related documents efficiently',
      href: '/files',
      icon: '📁',
    },
    {
      title: 'Form Builder',
      description: 'Create forms with drag-and-drop simplicity',
      href: '/forms',
      icon: '🔧',
    },
    {
      title: 'Submissions Manager',
      description: 'Manage form responses in a spreadsheet view',
      href: '/submissions',
      icon: '📊',
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Jotflow
          </h1>
          <p className="text-xl text-gray-600">
            The All-in-One Form Workspace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="block group"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md hover:border-blue-500">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                  {feature.title}
                </h2>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
