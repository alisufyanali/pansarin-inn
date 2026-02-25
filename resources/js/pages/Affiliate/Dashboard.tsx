// resources/js/pages/Affiliate/Dashboard.tsx
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
    balance: number;
    total_referrals: number;
    pending_commissions: number;
    affiliate_code: string;
}

interface Props {
    stats: Stats;
    is_affiliate: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Affiliate Dashboard', href: '/affiliates/dashboard' }];

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
            // Hum ab affiliate_code use kar rahe hain
            url.searchParams.set('ref', stats.affiliate_code);
            setGeneratedLink(url.toString());
            toast.success("Referral link taiyar hai!");
        } catch (e) {
            toast.error("Sahi URL enter karein (e.g. https://domain.com/product/abc)");
        }
    };

    if (!is_affiliate) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Affiliate Access" />
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center p-6">
                    <div className="bg-yellow-50 p-4 rounded-full"><AlertCircle className="w-12 h-12 text-yellow-500" /></div>
                    <h2 className="text-2xl font-bold">Access Denied</h2>
                    <p className="text-gray-500">Aap affiliate program ka hissa nahi hain. Please admin se rabta karein.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Affiliate Dashboard" />
            <div className="p-6 space-y-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Welcome, Affiliate!</h1>
                        <p className="text-muted-foreground">Apni sales aur earnings track karein.</p>
                    </div>
                    <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                        <span className="text-xs font-bold text-indigo-400 block uppercase">Your Referral Code</span>
                        <strong className="text-xl font-mono text-indigo-700">{stats.affiliate_code}</strong>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-b-4 border-b-green-500">
                        <CardHeader className="pb-2 text-xs font-semibold text-muted-foreground uppercase">Available Balance</CardHeader>
                        <CardContent><div className="text-3xl font-black">Rs. {Number(stats.balance).toLocaleString()}</div></CardContent>
                    </Card>
                    <Card className="border-b-4 border-b-blue-500">
                        <CardHeader className="pb-2 text-xs font-semibold text-muted-foreground uppercase">Total Sales</CardHeader>
                        <CardContent><div className="text-3xl font-black">{stats.total_referrals}</div></CardContent>
                    </Card>
                    <Card className="border-b-4 border-b-yellow-500">
                        <CardHeader className="pb-2 text-xs font-semibold text-muted-foreground uppercase">Pending</CardHeader>
                        <CardContent><div className="text-3xl font-black">Rs. {Number(stats.pending_commissions).toLocaleString()}</div></CardContent>
                    </Card>
                </div>

                <Card className="border-2 border-dashed">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Link className="w-5 h-5" /> Link Generator</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input placeholder="Product page link yahan paste karein..." value={productUrl} onChange={(e) => setProductUrl(e.target.value)} />
                            <Button onClick={handleGenerate} className="bg-indigo-600">Generate</Button>
                        </div>
                        {generatedLink && (
                            <div className="p-4 bg-indigo-50 border rounded-lg flex items-center justify-between">
                                <code className="text-sm truncate mr-4">{generatedLink}</code>
                                <Button size="sm" onClick={() => { navigator.clipboard.writeText(generatedLink); toast.success("Copied!"); }}>Copy</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}