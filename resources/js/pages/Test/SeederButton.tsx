import { useForm } from '@inertiajs/react';
import { Play, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SeederButton() {
    const { post, processing } = useForm({});

    const handleRun = () => {
        post(route('test.run-seeder'), {
            onSuccess: () => {
                toast.success('Backend Seeder successfully triggered!');
            },
            onError: (errors) => {
                toast.error('Seeder execution failed.');
                console.error(errors);
            }
        });
    };

    return (
        <div className="p-4 border rounded-lg bg-slate-50 flex flex-col gap-4">
            <h3 className="text-lg font-bold">Testing Tools</h3>
            <p className="text-sm text-gray-600">Click below to run "test-run-message" seeder.</p>
            
            <Button 
                onClick={handleRun} 
                disabled={processing}
                className="w-fit flex items-center gap-2"
            >
                {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Play className="h-4 w-4" />
                )}
                {processing ? 'Running Seeder...' : 'Run Test Seeder'}
            </Button>
        </div>
    );
}