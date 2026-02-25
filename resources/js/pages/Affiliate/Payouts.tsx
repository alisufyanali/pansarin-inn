import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { toast } from "sonner";

interface Props {
    balance: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payout Request',
        href: '/affiliate/payouts',
    },
];

export default function Payouts({ balance }: Props) {
    const minWithdraw = 500; // Minimum limit
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        payment_method: 'JazzCash',
        payment_details: ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (Number(data.amount) < minWithdraw) {
            toast.error(`Kam az kam Rs. ${minWithdraw} withdraw kar sakte hain.`);
            return;
        }
        if (Number(data.amount) > balance) {
            toast.error("Aapka balance kam hai.");
            return;
        }

        post(route('affiliate.payout.store'), {
            onSuccess: () => {
                toast.success("Payout request successfully submit!");
                reset();    
            },
            onError: () => {
                toast.error("check Form, something error happens.");
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Request Payout" />

            <div className="p-6 max-w-2xl mx-auto">
                <Card className="shadow-lg border-gray-200">
                    <CardHeader className="bg-gray-50/50 border-b">
                        <CardTitle className="text-2xl font-bold text-gray-800">Request Payout</CardTitle>
                        <p className="text-sm text-gray-500">withdraw your earnings.</p>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                        {/* Current Balance Display */}
                        <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-xl flex justify-between items-center">
                            <span className="text-green-700 font-medium">Available Balance:</span>
                            <span className="text-2xl font-black text-green-700">Rs. {balance.toLocaleString()}</span>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            {/* Amount Input */}
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount to Withdraw (Rs.)</Label>
                                <Input 
                                    id="amount"
                                    type="number" 
                                    placeholder="Enter amount (e.g. 1000)"
                                    className={errors.amount ? 'border-red-500 focus:ring-red-500' : ''}
                                    value={data.amount}
                                    onChange={e => setData('amount', e.target.value)}
                                    required
                                />
                                {errors.amount && <p className="text-red-500 text-xs font-medium">{errors.amount}</p>}
                            </div>

                            {/* Payment Method Select */}
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select 
                                    onValueChange={(value) => setData('payment_method', value)}
                                    defaultValue={data.payment_method}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="JazzCash">JazzCash</SelectItem>
                                        <SelectItem value="EasyPaisa">EasyPaisa</SelectItem>
                                        <SelectItem value="Bank">Bank Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Account Details Textarea */}
                            <div className="space-y-2">
                                <Label htmlFor="details">Account Details</Label>
                                <Textarea 
                                    id="details"
                                    placeholder="Number, Name, ya IBAN details yahan likhein..."
                                    className={`min-h-[100px] ${errors.payment_details ? 'border-red-500' : ''}`}
                                    value={data.payment_details}
                                    onChange={e => setData('payment_details', e.target.value)}
                                    required
                                />
                                {errors.payment_details && <p className="text-red-500 text-xs font-medium">{errors.payment_details}</p>}
                                <p className="text-xs text-gray-400">Enter account holder's name and number.</p>
                            </div>

                            {/* Submit Button */}
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 transition-all shadow-md"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Submitting...
                                    </span>
                                ) : 'Submit Payout Request'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}