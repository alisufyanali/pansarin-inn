import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Tag, Calendar, Hash } from 'lucide-react';

type AttributeValue = { 
    id: number; 
    value: string;
    slug: string;
};

type Attribute = { 
    id: number; 
    name: string;
    slug: string;
    values: AttributeValue[];
    created_at: string;
    updated_at: string;
};

export default function Show({ attribute }: { attribute: Attribute }) {
    const breadcrumbsWithId: BreadcrumbItem[] = [
        { title: 'Attributes', href: '/admin/attributes' },
        { title: attribute.name, href: `/admin/attributes/${attribute.id}` },
    ];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbsWithId}>
            <Head title={`Attribute: ${attribute.name}`} />
            
            <div className="p-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/attributes"
                            className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10 transition"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {attribute.name}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Attribute Details
                            </p>
                        </div>
                    </div>

                    <Link
                        href={`/admin/attributes/${attribute.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                        <Edit size={16} />
                        Edit Attribute
                    </Link>
                </div>

                <div className="max-w-4xl">
                    {/* Main Info Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Tag size={20} className="text-blue-600" />
                            Basic Information
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Attribute Name
                                </label>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {attribute.name}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Slug
                                </label>
                                <p className="text-lg font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-md inline-block">
                                    {attribute.slug}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                    <Hash size={14} />
                                    Attribute ID
                                </label>
                                <p className="text-lg text-gray-700 dark:text-gray-300">
                                    {attribute.id}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Total Values
                                </label>
                                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                    {attribute.values.length} {attribute.values.length === 1 ? 'value' : 'values'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Values Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Attribute Values ({attribute.values.length})
                        </h2>
                        
                        {attribute.values.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {attribute.values.map((val, index) => (
                                    <div 
                                        key={val.id}
                                        className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                                    >
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {val.value}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                                                {val.slug}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <Tag size={40} className="mx-auto mb-2 opacity-30" />
                                <p>No values added yet</p>
                            </div>
                        )}
                    </div>

                    {/* Timestamps Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-gray-600" />
                            Timestamps
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Created At
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    {formatDate(attribute.created_at)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Last Updated
                                </label>
                                <p className="text-gray-900 dark:text-white">
                                    {formatDate(attribute.updated_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}