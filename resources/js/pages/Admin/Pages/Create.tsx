import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import Form from './Form';

export default function Create() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Pages', href: route('admin.pages.index') }, { title: 'Create', href: '#' }]}>
            <Head title="Create Page" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Add New Custom Page</h1>
                    <p className="text-sm text-muted-foreground">Create a new information or policy page for your store.</p>
                </div>
                <Form />
            </div>
        </AppLayout>
    );
}