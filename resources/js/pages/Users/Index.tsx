import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/users' },
];

export default function Index({ users }: { users: Array<{ id: number; name: string; email: string }> }) {
    function handleDelete(id: number): void {
        if(confirm("Are you sure you want to delete this user?")) {
            router.delete(`users/${id}`)
    }
    }
    return (    
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="p-3">
                <Link
                    href="/users/create"
                    className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white mb-4 inline-block"
                >
                    Create New User
                </Link>

                <div className="bg-gray-900 rounded-xl p-4 shadow-lg">
                    <h2 className="text-lg font-semibold text-white mb-4">Users Table</h2>

                    <table className="w-full text-left text-gray-300">
                        <thead>
                            <tr className="bg-gray-800 text-gray-400">
                                <th className="py-3 px-4">ID</th>
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Email</th>
                                <th className="py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-800/50 transition">
                                    <td className="py-3 px-4">{user.id}</td>
                                    <td className="py-3 px-4">{user.name}</td>
                                    <td className="py-3 px-4">{user.email}</td>
                                    <td className="py-3 px-4 flex gap-2">
                                        <Link 
                                         href={`/users/${user.id}`}
                                        className="px-3 py-1 text-sm rounded-md bg-gray-700 hover:bg-gray-600 text-white">Show
                                        </Link>
                                        <Link 
                                        href={`/users/${user.id}/edit`}
                                        className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white">Edit
                                        </Link>
                                        <button 
                                        onClick={() => handleDelete(user.id)}
                                        className="px-3 py-1 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white">Delete
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
