import { can } from '@/lib/can';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Edit2, Trash2, PlusCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' },
];

export default function Index({ users }: {
    users: Array<{
        roles: Array<{ name?: string }>; id: number; name: string; email: string
    }>
}) {
    // Permission hooks (wrapper `can` calls the hook internally)
    const canCreate = can('create.users');
    const canEdit = can('edit.users');
    const canDelete = can('delete.users');

    function handleDelete(id: number): void {
        if (!canDelete) return;
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(`/users/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="p-3">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h2>
                    {canCreate && (
                        <Link
                            href="/users/create"
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <PlusCircle />
                            <span className="hidden sm:inline">Create</span>
                        </Link>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-lg">
                    <table className="w-full text-left text-gray-700 dark:text-gray-300">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                <th className="py-3 px-4">ID</th>
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Role</th>
                                <th className="py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                    <td className="py-3 px-4">{user.id}</td>
                                    <td className="py-3 px-4">{user.name}</td>
                                    <td className="py-3 px-4">{user.email}</td>
                                    <td className="py-3 px-4">{(user.roles ?? []).map((r: any) => r.name).join(', ')}</td>
                                    <td className="py-3 px-4 flex gap-2">
                                        <Link
                                            href={`/users/${user.id}`}
                                            className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white w-10 h-10"
                                            title="Show"
                                        >
                                            <Eye />
                                        </Link>

                                        {canEdit ? (
                                            <Link
                                                href={`/users/${user.id}/edit`}
                                                className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white w-10 h-10"
                                                title="Edit"
                                            >
                                                <Edit2 />
                                            </Link>
                                        ) : (
                                            <span
                                                aria-disabled
                                                className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 opacity-60 w-10 h-10"
                                                title="Edit (disabled)"
                                            >
                                                <Edit2 />
                                            </span>
                                        )}

                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className={
                                                `inline-flex items-center justify-center rounded-md ${canDelete ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600/40 text-white/60 opacity-60 cursor-not-allowed'} w-10 h-10`
                                            }
                                            title={canDelete ? 'Delete' : 'Delete (disabled)'}
                                            disabled={!canDelete}
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
