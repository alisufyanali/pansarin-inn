import React from 'react';
import { useForm } from '@inertiajs/react';

export default function Payouts({ balance }: { balance: number }) {
    const { data, setData, post, processing, errors } = useForm({
        amount: '',
        payment_method: 'JazzCash',
        payment_details: ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('affiliate.payout.store'));
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
            <h2 className="text-xl font-bold mb-4">Request Payout</h2>
            <p className="mb-4 text-gray-600">Current Balance: <strong>Rs. {balance}</strong></p>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label>Amount to Withdraw</label>
                    <input 
                        type="number" 
                        className="w-full border p-2 rounded"
                        value={data.amount}
                        onChange={e => setData('amount', e.target.value)}
                    />
                    {errors.amount && <span className="text-red-500 text-sm">{errors.amount}</span>}
                </div>
                <div>
                    <label>Method</label>
                    <select className="w-full border p-2 rounded" onChange={e => setData('payment_method', e.target.value)}>
                        <option value="JazzCash">JazzCash</option>
                        <option value="EasyPaisa">EasyPaisa</option>
                        <option value="Bank">Bank Transfer</option>
                    </select>
                </div>
                <div>
                    <label>Account Details (Number/IBAN)</label>
                    <textarea 
                        className="w-full border p-2 rounded"
                        onChange={e => setData('payment_details', e.target.value)}
                    ></textarea>
                </div>
                <button 
                    disabled={processing}
                    className="w-full bg-green-600 text-white py-2 rounded font-bold"
                >
                    {processing ? 'Submitting...' : 'Submit Request'}
                </button>
            </form>
        </div>
    );
}