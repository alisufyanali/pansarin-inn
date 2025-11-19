import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, } from '@inertiajs/react';
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';


type Permission = {
    id: number;
    name: string;
    // add other fields if present
};

interface Props {
    permissions: Permission[];
}
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Create Roles', href: '/roles/create' },
];

export default function RoleCreate({ permissions }: Props) {
    const { data, setData, errors, post } = useForm({
        name: '',
        permission: [],
    });

    function submit(e: { preventDefault: () => void; }) {
        e.preventDefault();
        post('/roles');
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="p-3">
                <Link
                    href="/roles"
                    className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white mb-4 inline-block">
                    Back
                </Link>

                <div className="min-h-screen flex items-center justify-center  p-6">
                    <div className="max-w-md w-full bg-gray-800 rounded-xl p-6 shadow-lg">
                        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Create New Role</h2>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter Name"
                                    className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                />
                                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Permission:</label>

                                <div className="grid grid-cols-2 gap-3">
                                    {permissions.map((permission: Permission) => (
                                        <label key={permission.id} className="inline-flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                value={permission.name}
                                                id={permission.id}
                                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                            <span className="text-sm text-white capitalize">{permission.name}</span>
                                        </label>
                                    ))}
                                </div>

                                {errors.permission && (
                                    <div className="text-red-500 text-sm mt-1">{errors.permission}</div>
                                )}
                            </div>


                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium mt-2 transition"
                            >
                                Register
                            </button>
                        </form>
                    </div>
                </div>


            </div>

        </AppLayout>
    );
}
