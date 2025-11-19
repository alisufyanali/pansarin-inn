import AppLayout from '@/layouts/app-layout';
import roles from '@/routes/roles';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles', href: '/roles' },
];

export default function Index({ roles }: { roles: Array<{ id: number; name: string }> }) {
    function handleDelete(id: number): void {
        if(confirm("Are you sure you want to delete this role?")) {
            router.delete(`roles/${id}`)
    }
    }
    return (    
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="p-3">
                <Link
                    href="/roles/create"
                    className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white mb-4 inline-block"
                >
                    Create New Role
                </Link>

                <div className="bg-gray-900 rounded-xl p-4 shadow-lg">
                    <h2 className="text-lg font-semibold text-white mb-4">Roles Table</h2>
                    <table className="w-full text-left text-gray-300">
                        <thead>
                            <tr className="bg-gray-800 text-gray-400">
                                <th className="py-3 px-4">ID</th>
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {roles.map(role => (
                                <tr key={role.id} className="hover:bg-gray-800/50 transition">
                                    <td className="py-3 px-4">{role.id}</td>
                                    <td className="py-3 px-4">{role.name}</td>
                                    <td className="py-3 px-4 flex gap-2">
                                        <Link 
                                         href={`/roles/${role.id}`}
                                        className="px-3 py-1 text-sm rounded-md bg-gray-700 hover:bg-gray-600 text-white">Show
                                        </Link>
                                        <Link 
                                        href={`/roles/${role.id}/edit`}
                                        className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white">Edit
                                        </Link>
                                        <button 
                                        onClick={() => handleDelete(role.id)}
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
