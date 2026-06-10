import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Star, Save, ArrowLeft } from 'lucide-react';
import FieldError from '@/components/FieldError';
import { inputClass, cardClass, labelClass, buttonPrimaryClass, buttonSecondaryClass } from '@/utils/formStyles';

type Order    = { id: number; order_number: string; customer_id: number };
type Customer = { id: number; first_name: string; last_name: string; phone: string };

export type ReviewFormData = {
    order_id:    string | number;
    customer_id: string | number;
    rating:      number;
    review:      string;
    status:      string;
    admin_reply: string;
};

interface Props {
    review?: ReviewFormData & { id?: number };
    orders: Order[];
    customers: Customer[];
    isEdit?: boolean;
}

export default function Form({ review, orders, customers, isEdit = false }: Props) {
    const { data, setData, errors, post, put, processing } = useForm<ReviewFormData>({
        order_id:    review?.order_id    || '',
        customer_id: review?.customer_id || '',
        rating:      review?.rating      || 5,
        review:      review?.review      || '',
        status:      review?.status      || 'pending',
        admin_reply: review?.admin_reply || '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        isEdit && review?.id ? put(`/admin/order-reviews/${review.id}`) : post('/admin/order-reviews');
    }

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/order-reviews" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEdit ? 'Edit Review' : 'Add Review'}
                </h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className={cardClass}>
                    <div className="space-y-4">
                        <div>
                            <label className={labelClass}>Order <span className="text-red-500">*</span></label>
                            <select value={data.order_id} onChange={e => setData('order_id', e.target.value)} className={inputClass(errors.order_id)} required>
                                <option value="">Select order</option>
                                {orders.map(o => (
                                    <option key={o.id} value={o.id}>{o.order_number}</option>
                                ))}
                            </select>
                            <FieldError message={errors.order_id} />
                        </div>

                        <div>
                            <label className={labelClass}>Customer <span className="text-red-500">*</span></label>
                            <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)} className={inputClass(errors.customer_id)} required>
                                <option value="">Select customer</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.phone}</option>
                                ))}
                            </select>
                            <FieldError message={errors.customer_id} />
                        </div>

                        <div>
                            <label className={labelClass}>Rating <span className="text-red-500">*</span></label>
                            <div className="flex gap-2 mt-1">
                                {[1,2,3,4,5].map(n => (
                                    <button key={n} type="button" onClick={() => setData('rating', n)}
                                        className="focus:outline-none">
                                        <Star className={`w-7 h-7 transition-colors ${n <= data.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-gray-500 self-center">{data.rating}/5</span>
                            </div>
                            <FieldError message={errors.rating} />
                        </div>

                        <div>
                            <label className={labelClass}>Review</label>
                            <textarea value={data.review} onChange={e => setData('review', e.target.value)}
                                rows={4} placeholder="Customer's review..." className={inputClass(errors.review) + ' resize-none'} />
                            <FieldError message={errors.review} />
                        </div>

                        <div>
                            <label className={labelClass}>Status <span className="text-red-500">*</span></label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)} className={inputClass(errors.status)}>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <FieldError message={errors.status} />
                        </div>

                        <div>
                            <label className={labelClass}>Admin Reply</label>
                            <textarea value={data.admin_reply} onChange={e => setData('admin_reply', e.target.value)}
                                rows={3} placeholder="Optional reply to customer..." className={inputClass(errors.admin_reply) + ' resize-none'} />
                            <FieldError message={errors.admin_reply} />
                        </div>
                    </div>
                </div>

                <div className={cardClass}>
                    <div className="space-y-3">
                        <button type="submit" disabled={processing} className={buttonPrimaryClass}>
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : isEdit ? 'Update Review' : 'Add Review'}
                        </button>
                        <Link href="/admin/order-reviews" className={buttonSecondaryClass}>Cancel</Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
