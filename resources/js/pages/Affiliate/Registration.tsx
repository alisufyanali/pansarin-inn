import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const Registration: React.FC = () => {
    const [agreed, setAgreed] = useState(false);
    const { post, processing, errors } = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreed) {
            alert('Please agree to the terms and conditions.');
            return;
        }
        post(route('vendor.affiliate.store')); // Route name confirm kar lein
    };

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Head title="Become an Affiliate" />
            
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Join Our Affiliate Family</CardTitle>
                    <CardDescription>
                        Har successful referral par commission kamayein aur apne network ko barhayein.
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground border border-dashed border-primary/20">
                            * Aapko foran ek unique referral link milega jisay aap share kar saktay hain.
                        </div>

                        <div className="flex items-start space-x-2">
                            <Checkbox 
                                id="terms" 
                                checked={agreed} 
                                onCheckedChange={(checked) => setAgreed(checked as boolean)} 
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="terms" className="text-sm font-medium leading-none">
                                    I agree to the Affiliate Terms and Conditions
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Aapka commission har delivery ke baad balance mein add hoga.
                                </p>
                            </div>
                        </div>

                        {errors && Object.keys(errors).length > 0 && (
                            <div className="text-destructive text-sm font-medium">
                                {Object.values(errors)[0]}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={processing || !agreed}
                        >
                            {processing ? 'Processing...' : 'Apply as Affiliate'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Registration;