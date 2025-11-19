import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Edit User', href: '/users/edit' },
];

export default function UserEdit({ user }: { user: {
    password_confirmation: string;
    password: string; id: number; name: string; email: string 
} }) {
    const { data, setData, errors, put } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: user.password || '',
        password_confirmation: user.password_confirmation || '',
    });

    function submit(e: { preventDefault: () => void; }){
        e.preventDefault();
        put(`/users/${user.id}`);
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="p-3">
                <Link
                    href="/users"
                    className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white mb-4 inline-block">
                    Back
                </Link>

                <div className="min-h-screen flex items-center justify-center  p-6">
                    <div className="max-w-md w-full bg-gray-800 rounded-xl p-6 shadow-lg">
                        <h2 className="text-2xl font-semibold text-white mb-6 text-center">Edit User</h2>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your name"
                                    className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                />
                                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}

                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                />
                                {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter password"
                                    className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                />
                                {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                            </div>
                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                    className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                />
                                {errors.password_confirmation && <div className="text-red-500 text-sm mt-1">{errors.password_confirmation}</div>}
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
