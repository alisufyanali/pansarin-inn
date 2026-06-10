import { useForm } from '@inertiajs/react';
import { ShoppingCart, CheckCircle2, Loader2, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SeederDashboard() {
    const { post, processing } = useForm({});

    const handleAction = (routeName: string, successMsg: string) => {
        post(route(routeName), {
            onSuccess: () => toast.success(successMsg),
            onError: () => toast.error('Kuch masla hua hai, logs check karein.'),
        });
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 border-b pb-4">
                <Terminal className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold italic text-gray-800">Affiliate System Testing Lab</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* STEP 1: Place Order */}
                <div className="p-6 border-2 border-dashed rounded-xl bg-white hover:border-blue-400 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">Step 1</span>
                        <h2 className="text-lg font-semibold italic text-gray-700">Place Order</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 italic">
                        "referral1@example.com" ke liye ek pending order create karein.
                    </p>
                    <Button 
                        onClick={() => handleAction('test.place-order', 'Order Placed Successfully!')}
                        disabled={processing}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {processing ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                        Run PlaceOrder Seeder
                    </Button>
                </div>

                {/* STEP 2: Deliver Order */}
                <div className="p-6 border-2 border-dashed rounded-xl bg-white hover:border-green-400 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Step 2</span>
                        <h2 className="text-lg font-semibold italic text-gray-700">Deliver & Complete</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 italic">
                        Pending order ko 'Delivered' mark karein aur commission trigger karein.
                    </p>
                    <Button 
                        onClick={() => handleAction('test.deliver-order', 'Order Delivered & Paid!')}
                        disabled={processing}
                        // "success" ko "default" se badal dein
                        variant="default" 
                        // Yahan green color add kar dein
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                        {processing ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        Run OrderDeliver Seeder
                    </Button>
                </div>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg text-xs font-mono text-green-400 shadow-inner">
                <p>// Status Monitor</p>
                <p>{processing ? '> Executing Artisan command...' : '> Ready for next test session.'}</p>
            </div>
        </div>
    );
}