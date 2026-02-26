import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Edit2, FolderTree, Image as ImageIcon } from 'lucide-react';
import InfoRow from '@/components/InfoRow';
import SectionCard from '@/components/SectionCard';
import PageHeader, { ActionButton } from '@/components/PageHeader';
import StatusCard from '@/components/StatusCard';
import StatsCard from '@/components/StatsCard';
import TimelineCard from '@/components/TimelineCard';

interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    status: boolean;
    parent?: { id: number; name: string } | null;
    children?: Category[];
    products?: any[];
    created_at?: string;
    updated_at?: string;
}

interface Props {
    category: Category;
}

export default function Show({ category }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Categories', href: '/admin/categories' },
        { title: category.name, href: '#' },
    ];

    const stats = [
        { label: 'Parent Category', value: category.parent?.name || 'Root Category' },
        { label: 'Subcategories', value: category.children?.length || 0 },
        { label: 'Products', value: category.products?.length || 0, color: 'text-green-600 dark:text-green-400' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={category.name} />

            <div className="p-3">
                <PageHeader
                    title={category.name}
                    backUrl="/admin/categories"
                    actions={<ActionButton href={`/admin/categories/${category.id}/edit`} icon={Edit2} label="Edit Category" />}
                />

                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <SectionCard title="Category Information" icon={FolderTree}>
                                <div className="space-y-4">
                                    <InfoRow label="Name" value={category.name} />
                                    <InfoRow label="Slug" value={category.slug} mono />
                                    <InfoRow label="Parent Category" value={category.parent?.name || 'Root Category'} />
                                </div>
                            </SectionCard>

                            {category.image && (
                                <SectionCard title="Category Image" icon={ImageIcon}>
                                    <img
                                        src={`/storage/${category.image}`}
                                        alt={category.name}
                                        className="h-auto w-full rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                                    />
                                </SectionCard>
                            )}

                            {category.children && category.children.length > 0 && (
                                <SectionCard title="Subcategories" icon={FolderTree}>
                                    <div className="flex flex-wrap gap-2">
                                        {category.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={`/admin/categories/${child.id}`}
                                                className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 transition hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                </SectionCard>
                            )}
                        </div>

                        <div className="space-y-6">
                            <StatusCard isActive={category.status} />

                            <StatsCard stats={stats} />

                            {category.created_at && (
                                <TimelineCard
                                    createdAt={category.created_at}
                                    updatedAt={category.updated_at}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
