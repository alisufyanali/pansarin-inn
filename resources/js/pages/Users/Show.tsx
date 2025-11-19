import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Show User', href: '/users' },
];

export default function Edit({ user }){
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="p-3">
                <Link
                    href="/users"
                    className="px-3 py-1 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white mb-4 inline-block">
                    Back
                </Link>
                <div>
                    <p><strong>Name: </strong>{user.name}</p>
                    <p><strong>Email: </strong>{user.email}</p>
                </div>
            </div>

        </AppLayout>
    );
}
