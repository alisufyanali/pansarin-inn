import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles', href: '/roles' },
];

// ...existing code...
type Permission = { id: number; name: string };
interface Props {
  role: { id: number; name: string; permissions?: Permission[] };
  permissions?: string[]; // if your controller also passes a plain string[] of permission names
}

export default function RoleShow({ role, permissions }: Props) {
  const permNames =
    permissions ?? role.permissions?.map((p) => p.name) ?? [];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Roles" />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/roles"
            className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
            title="Back"
          >
            <ArrowLeft />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href={`/roles/${role.id}/edit`}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white w-10 h-10"
              title="Edit"
            >
              <Edit2 />
            </Link>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this role?')) {
                  router.delete(`/roles/${role.id}`);
                }
              }}
              className="inline-flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 text-white w-10 h-10"
              title="Delete"
            >
              <Trash2 />
            </button>
          </div>
        </div>

        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Role Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-300">Name</label>
              <input
                readOnly
                value={role.name}
                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-300">Permissions</label>
              <textarea
                readOnly
                value={permNames.join(', ')}
                rows={4}
                className="w-full mt-1 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
