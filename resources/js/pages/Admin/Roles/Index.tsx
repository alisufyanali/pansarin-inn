import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit2, Trash2, Plus } from 'lucide-react';

type Permission = { name: string };

type Role = {
    id: number;
    name: string;
    permissions?: Permission[];
};

interface Props {
    roles: Role[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles', href: '/roles' },
];

export default function Index({ roles }: Props) {
    function handleDelete(id: number): void {
        if (confirm('Are you sure you want to delete this role?')) {
            router.delete(`/roles/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="p-3">
                <Link
                    href="/roles/create"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white mb-4"
                >
                    <Plus />
                </Link>

                <div className="rounded-xl p-4 shadow-lg bg-white dark:bg-gray-900">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Roles Table</h2>

                    <table className="w-full text-left text-gray-900 dark:text-gray-300">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400">
                                <th className="py-3 px-4">ID</th>
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Permissions</th>
                                <th className="py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {roles.map((role, index) => (
                                <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                    <td className="py-3 px-4">{index + 1}</td>
                                    <td className="py-3 px-4">{role.name}</td>
                                    <td className="py-3 px-4">{(role.permissions ?? []).map((p) => p.name).join(', ')}</td>
                                    <td className="py-3 px-4 flex gap-2">
                                        <Link
                                            href={`/roles/${role.id}`}
                                            className="inline-flex items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 w-10 h-10"
                                            title="Show"
                                        >
                                            <Eye />
                                        </Link>

                                        <Link
                                            href={`/roles/${role.id}/edit`}
                                            className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white w-10 h-10"
                                            title="Edit"
                                        >
                                            <Edit2 />
                                        </Link>

                                        <button
                                            onClick={() => handleDelete(role.id)}
                                            className="inline-flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 text-white w-10 h-10"
                                            title="Delete"
                                        >
                                            <Trash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
