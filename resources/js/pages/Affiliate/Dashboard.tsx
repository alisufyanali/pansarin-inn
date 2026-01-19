import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Copy, Link } from "lucide-react";
import React, { useState } from 'react';
import { toast } from "sonner";

interface Stats {
    balance: number | string;
    total_referrals: number;
    pending_commissions: number | string;
    affiliate_code: string;
}

interface Props {
    stats: Stats;
    is_affiliate: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Affiliate Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ stats, is_affiliate }: Props) {
    const [productUrl, setProductUrl] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');

    const handleGenerate = () => {
        if (!productUrl) {
            toast.error("Pehle product URL paste karein");
            return;
        }
        try {
            const url = new URL(productUrl);
            url.searchParams.set('ref', stats.affiliate_code);
            setGeneratedLink(url.toString());
            toast.success("Referral link generate ho gaya!");
        } catch (e) {
            toast.error("Valid URL enter karein (https:// ke sath)");
        }
    };

    const copyToClipboard = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink);
        toast.success("Link copy kar liya gaya hai!");
    };

    // Agar user affiliate nahi hai
    if (!is_affiliate) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Affiliate Dashboard" />
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center p-6">
                    <div className="bg-yellow-50 p-4 rounded-full">
                        <AlertCircle className="w-12 h-12 text-yellow-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Affiliate Program</h2>
                    <p className="text-gray-500 max-w-sm">
                        You are not a part of affiliate Program. Please contact with to register.
                    </p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Affiliate Dashboard" />

            <div className="p-6 space-y-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Affiliate Dashboard</h1>
                        <p className="text-gray-500">Track your earnings and referrals.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-100 font-mono shadow-sm">
                        <span className="text-xs uppercase font-bold text-indigo-400">Your Code:</span>
                        <strong className="text-lg">{stats.affiliate_code}</strong>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-l-green-500 shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Available Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-gray-900">Rs. {Number(stats.balance).toLocaleString()}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-blue-500 shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Referrals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-gray-900">{stats.total_referrals}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-yellow-500 shadow-sm overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Commission</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-gray-900">Rs. {Number(stats.pending_commissions).toLocaleString()}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Link Generator */}
                <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-dashed border-gray-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <Link className="w-5 h-5 text-indigo-600" /> Referral Link Generator
                        </CardTitle>
                        <p className="text-sm text-gray-500">Enter product url for generating referral code</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1">
                                <Input 
                                    type="text" 
                                    placeholder="e.g., https://pansariinn.com/product/honey"
                                    value={productUrl}
                                    onChange={(e) => setProductUrl(e.target.value)}
                                    className="h-11 bg-white border-gray-300 focus:ring-indigo-500"
                                />
                            </div>
                            <Button onClick={handleGenerate} size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                                Generate Link
                            </Button>
                        </div>

                        {generatedLink && (
                            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl animate-in fade-in zoom-in-95 duration-300">
                                <Label className="text-xs font-bold text-indigo-600 mb-2 block uppercase">Your Unique Referral Link:</Label>
                                <div className="flex flex-col md:flex-row items-center gap-3">
                                    <div className="w-full bg-white p-3 rounded-lg border border-indigo-200 shadow-inner">
                                        <code className="text-sm text-indigo-800 break-all font-mono font-medium leading-relaxed">
                                            {generatedLink}
                                        </code>
                                    </div>
                                    <Button 
                                        onClick={copyToClipboard} 
                                        variant="outline" 
                                        className="w-full md:w-auto shrink-0 bg-white border-indigo-200 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <Copy className="w-4 h-4 mr-2" /> Copy Link
                                    </Button>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-green-600 text-xs font-medium">
                                    <CheckCircle2 className="w-4 h-4" /> 
                                    Share this link, get commission on every sales.
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}