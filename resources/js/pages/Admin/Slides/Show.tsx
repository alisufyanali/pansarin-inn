import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Monitor, Smartphone, Pencil } from 'lucide-react';
import { cardClass } from '@/utils/formStyles';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Slides', href: '/admin/slides' },
    { title: 'View', href: '#' },
];

export default function Show({ slide }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="View Slide" />
            <div className="p-4 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Slide #{slide.id}</h1>
                    <Link href={`/admin/slides/${slide.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        <Pencil className="w-4 h-4" /> Edit
                    </Link>
                </div>

                {slide.image && (
                    <img src={`/storage/${slide.image}`} alt={slide.title}
                        className="w-full h-48 object-cover rounded-xl border border-gray-200 dark:border-gray-700 mb-6" />
                )}

                <div className={cardClass}>
                    <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                        <div className="py-3 flex justify-between items-center">
                            <dt className="text-sm text-gray-500">Type</dt>
                            <dd className="flex items-center gap-1.5 font-medium">
                                {slide.type === 'desktop' ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                                {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)}
                            </dd>
                        </div>
                        <div className="py-3 flex justify-between"><dt className="text-sm text-gray-500">Title</dt><dd className="font-semibold">{slide.title || '—'}</dd></div>
                        <div className="py-3 flex justify-between"><dt className="text-sm text-gray-500">Subtitle</dt><dd className="text-sm max-w-xs text-right">{slide.subtitle || '—'}</dd></div>
                        <div className="py-3 flex justify-between"><dt className="text-sm text-gray-500">Button Text</dt><dd>{slide.btn_text || '—'}</dd></div>
                        <div className="py-3 flex justify-between"><dt className="text-sm text-gray-500">Button URL</dt><dd className="text-blue-600 text-sm">{slide.btn_url || '—'}</dd></div>
                        <div className="py-3 flex justify-between"><dt className="text-sm text-gray-500">Sort Order</dt><dd className="font-mono">{slide.sort_order}</dd></div>
                        <div className="py-3 flex justify-between items-center">
                            <dt className="text-sm text-gray-500">Status</dt>
                            <dd><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${slide.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {slide.is_active ? 'Active' : 'Inactive'}
                            </span></dd>
                        </div>
                    </dl>
                </div>

                <div className="mt-4">
                    <Link href="/admin/slides" className="text-sm text-blue-600 hover:underline">← Back to Slides</Link>
                </div>
            </div>
        </AppLayout>
    );
}
