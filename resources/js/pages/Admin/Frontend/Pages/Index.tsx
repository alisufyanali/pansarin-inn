import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataTableWrapper from '@/components/DataTableWrapper'; 
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Frontend', href: '#' },
    { title: 'Pages', href: route('admin.pages.index') },
];

export default function Index() {
    const { delete: destroy } = useForm({});

    const handleDelete = (id: number) => {
        if (confirm('Kya aap waqai is page ko delete karna chahte hain?')) {
            destroy(route('admin.pages.destroy', id), {
                onSuccess: () => toast.success('Page deleted successfully!'),
            });
        }
    };

    const columns = [
        {
            name: 'Page Title',
            selector: (row: any) => row.title,
            sortable: true,
            cell: (row: any) => (
                <div className="py-2">
                    <div className="font-bold text-gray-900 dark:text-white">{row.title}</div>
                    <div className="text-xs text-muted-foreground italic">/{row.slug}</div>
                </div>
            ),
        },
        {
            name: 'Status',
            selector: (row: any) => row.status,
            sortable: true,
            cell: (row: any) => (
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                    {row.status}
                </span>
            ),
        },
        {
            name: 'Actions',
            cell: (row: any) => (
                <div className="flex items-center gap-2">
                    <Link href={route('admin.pages.edit', row.id)}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                    </Link>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleDelete(row.id)}
                    >
                        <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                </div>
            ),
        },
    ];

    // CSV Export ke liye headers
    const csvHeaders = [
        { label: 'Title', key: 'title' },
        { label: 'Slug', key: 'slug' },
        { label: 'Status', key: 'status' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Pages" />
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-600" /> Pages
                    </h1>
                    <Link href={route('admin.pages.create')}>
                        <Button className="bg-indigo-600 text-white">
                            <Plus className="w-4 h-4 mr-2" /> Add Page
                        </Button>
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
                    <DataTableWrapper 
                        fetchUrl="/admin/pages-data" // Yahan wo URL aayega jo JSON data return kare
                        columns={columns} 
                        csvHeaders={csvHeaders}
                        searchableKeys={['title', 'slug']}
                    />
                </div>
            </div>
        </AppLayout>
    );
}