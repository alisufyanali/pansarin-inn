import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Link, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner"; // Agar aap sonner use kar rahe hain

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

export default function Dashboard({ stats, is_affiliate }: Props) {
    const [productUrl, setProductUrl] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');

    const handleGenerate = () => {
        if (!productUrl) return;
        try {
            const url = new URL(productUrl);
            url.searchParams.set('ref', stats.affiliate_code);
            setGeneratedLink(url.toString());
        } catch (e) {
            alert("Please enter a valid URL (including https://)");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        alert("Link copied to clipboard!");
    };

    if (!is_affiliate) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
             <AlertCircle className="w-12 h-12 text-yellow-500" />
             <p className="text-xl font-semibold">Please register for the affiliate program first.</p>
        </div>
    );

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <Head title="Affiliate Dashboard" />
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Affiliate Dashboard</h1>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-mono text-sm border border-primary/20">
                    Code: <strong>{stats.affiliate_code}</strong>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Available Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rs. {stats.balance}</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total Referrals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_referrals}</div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Pending Commission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rs. {stats.pending_commissions}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Link Generator */}
            <Card className="bg-gradient-to-br from-white to-slate-50 border-dashed border-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Link className="w-5 h-5" /> Referral Link Generator
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input 
                            type="text" 
                            placeholder="Paste Product URL here (e.g., https://pansariinn.com/product/honey)"
                            value={productUrl}
                            onChange={(e) => setProductUrl(e.target.value)}
                            className="bg-white"
                        />
                        <Button onClick={handleGenerate}>Generate</Button>
                    </div>

                    {generatedLink && (
                        <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                            <Label className="text-xs text-muted-foreground mb-2 block">Your Unique Referral Link:</Label>
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <code className="flex-1 text-sm text-blue-700 break-all font-mono">{generatedLink}</code>
                                <Button size="sm" variant="outline" onClick={copyToClipboard} className="shrink-0 bg-white">
                                    <Copy className="w-4 h-4 mr-2" /> Copy
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}