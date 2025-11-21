import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Show User', href: '/users/show' },
];

export default function Show({ user }: { user: { id: number; name: string; email: string } }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Show user" />
            <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <Link
                        href="/users"
                        className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                        title="Back"
                    >
                        <ArrowLeft />
                    </Link>
                </div>

                <div className="mt-2">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/users/${user.id}/edit`}
                                    className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                                    title="Edit"
                                >
                                    <Edit2 />
                                </Link>

                                <Link
                                    href={`/users/${user.id}`}
                                    method="delete"
                                    as="button"
                                    className="inline-flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 text-white w-10 h-10"
                                    title="Delete"
                                >
                                    <Trash2 />
                                </Link>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                <input readOnly value={user.name} className="mt-1 w-full rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input readOnly value={user.email} className="mt-1 w-full rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
