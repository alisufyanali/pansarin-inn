import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Edit2, Mail, MapPin, User, Phone } from 'lucide-react';
import InfoRow from '@/components/InfoRow';
import SectionCard from '@/components/SectionCard';
import PageHeader from '@/components/PageHeader';

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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customers', href: '/admin/customers' },
        { title: fullName, href: `/admin/customers/${customer.id}` },
        { title: 'Details', href: '#' },
    ];

    const actions = (
        <Link
            href={`/admin/customers/${customer.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
            <Edit2 className="w-4 h-4" />
            Edit
        </Link>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer: ${fullName}`} />

            <div className="p-3">
                <PageHeader
                    title={fullName}
                    backUrl="/admin/customers"
                    actions={actions}
                />

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Personal Information */}
                    <SectionCard
                        title="Personal Information"
                        icon={User}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow
                                label="First Name"
                                value={customer.first_name}
                            />
                            <InfoRow
                                label="Last Name"
                                value={customer.last_name || '-'}
                            />
                        </div>
                    </SectionCard>

                    {/* Contact Information */}
                    <SectionCard
                        title="Contact Information"
                        icon={Phone}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow
                                label="Phone Number"
                                value={customer.phone}
                            />
                            <InfoRow
                                label="Email Address"
                                value={customer.email || '-'}
                            />
                        </div>
                    </SectionCard>

                    {/* Address Information */}
                    <SectionCard
                        title="Address Information"
                        icon={MapPin}
                    >
                        <div className="space-y-4">
                            <InfoRow
                                label="Address"
                                value={customer.address || '-'}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoRow
                                    label="City"
                                    value={customer.city?.name || '-'}
                                />
                                <InfoRow
                                    label="Country"
                                    value={customer.country || '-'}
                                />
                            </div>
                        </div>
                    </SectionCard>

                    {/* System Information */}
                    <SectionCard
                        title="System Information"
                        icon={User}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow
                                label="Member Since"
                                value={new Date(customer.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            />
                            <InfoRow
                                label="Last Updated"
                                value={new Date(customer.updated_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            />
                        </div>
                    </SectionCard>
                </div>
            </div>
        </AppLayout>
    );
}