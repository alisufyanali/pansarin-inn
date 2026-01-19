import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck, UserPlus, Zap } from "lucide-react";
import React, { useState } from 'react';
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Affiliate Registration',
        href: '/affiliate/register',
    },
];

const Registration: React.FC = () => {
    const [agreed, setAgreed] = useState(false);
    
    // useForm hook
    const { post, processing, errors } = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!agreed) {
            toast.error('Please agree to the terms and conditions first.');
            return;
        }

        post(route('vendor.affiliate.store'), {
            onSuccess: () => {
                toast.success('Congratulations! you are now a part of affiliate program.');
            },
            onError: () => {
                toast.error('There is something issue while registring.');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Become an Affiliate" />
            
            <div className="flex items-center justify-center min-h-[70vh] p-4">
                <Card className="max-w-md w-full shadow-xl border-gray-200">
                    <CardHeader className="text-center space-y-2 pb-6 border-b bg-gray-50/50">
                        <div className="mx-auto bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                            <UserPlus className="text-indigo-600 w-6 h-6" />
                        </div>
                        <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">
                            Join Our Affiliate Family
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            Get commission on every sales your referrals get.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-8">
                        <form onSubmit={submit} className="space-y-6">
                            {/* Benefits Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
                                    <span>Instant unique referral link generate.</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                                    <span>Transparent tracking and automatic payouts.</span>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Terms Checkbox */}
                            <div className="flex items-start space-x-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                <Checkbox 
                                    id="terms" 
                                    checked={agreed} 
                                    onCheckedChange={(checked) => setAgreed(checked as boolean)} 
                                    className="mt-1 border-indigo-300 data-[state=checked]:bg-indigo-600"
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label 
                                        htmlFor="terms" 
                                        className="text-sm font-bold text-gray-800 cursor-pointer"
                                    >
                                        I agree to the Affiliate Terms
                                    </Label>
                                    <p className="text-xs text-gray-500 leading-normal">
                                        Commission order added to your balance after delivery.
                                    </p>
                                </div>
                            </div>

                            {/* Error Display - Red Line Fixed Here */}
                            {errors && Object.keys(errors).length > 0 && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                        {(Object.values(errors) as string[])[0]}
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <Button 
                                type="submit" 
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-indigo-200" 
                                disabled={processing || !agreed}
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </span>
                                ) : 'Apply as Affiliate'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Registration;