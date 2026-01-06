import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit2, Mail, MapPin, User, Phone } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Customers', href: '/admin/customers' },
    { title: 'Details', href: '#' },
];

interface Customer {
    id: number;
    first_name: string;
    last_name: string | null;
    phone: string;
    email: string | null;
    address: string | null;
    city_id: number | null;
    country: string | null;
    city?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

export default function Show({ customer }: { customer: Customer }) {
    const fullName = `${customer.first_name} ${customer.last_name || ''}`.trim();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer: ${fullName}`} />

            <div className="p-3">
                <div className="flex items-center justify-between mb-4">
                    <Link
                        href="/admin/customers"
                        className="inline-flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white w-10 h-10"
                        title="Back"
                    >
                        <ArrowLeft />
                    </Link>

                    <Link
                        href={`/admin/customers/${customer.id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </Link>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Header Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-2xl p-8 text-white mb-6 shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{fullName}</h1>
                                <div className="flex flex-col gap-1 mt-2">
                                    <p className="text-blue-100 flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        {customer.phone}
                                    </p>
                                    {customer.email && (
                                        <p className="text-blue-100 flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            {customer.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                Customer Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                                        First Name
                                    </label>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {customer.first_name}
                                    </p>
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                                        Last Name
                                    </label>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {customer.last_name || '-'}
                                    </p>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                                        <Phone className="w-4 h-4" />
                                        Phone Number
                                    </label>
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {customer.phone}
                                    </p>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                                        <Mail className="w-4 h-4" />
                                        Email Address
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {customer.email || '-'}
                                    </p>
                                </div>

                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4" />
                                        Address
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {customer.address || '-'}
                                    </p>
                                </div>

                                {/* City */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4" />
                                        City
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {customer.city?.name || '-'}
                                    </p>
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4" />
                                        Country
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {customer.country || '-'}
                                    </p>
                                </div>

                                {/* Created Date */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                                        Member Since
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(customer.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {/* Last Updated */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                                        Last Updated
                                    </label>
                                    <p className="text-gray-900 dark:text-white">
                                        {new Date(customer.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}