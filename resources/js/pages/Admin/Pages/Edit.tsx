import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import Form from './Form';

interface Props {
    page: any;
}

export default function Edit({ page }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Pages', href: route('admin.pages.index') }, { title: 'Edit Page', href: '#' }]}>
            <Head title={`Edit - ${page.title}`} />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Edit Page: {page.title}</h1>
                    <p className="text-sm text-muted-foreground">Modify the content and SEO settings for this page.</p>
                </div>
                <Form page={page} isEdit={true} />
            </div>
        </AppLayout>
    );
}