import { useForm } from '@inertiajs/react';
import { Save, MessageCircle, Plus, Trash2 } from 'lucide-react';
import toast from "react-hot-toast";

export default function FaqsTab({ settings }: { settings: any }) {
    const getInitialFaqs = () => {
        try {
            const rawValue = settings?.faqs?.value;
            
            if (!rawValue) return [{ question: '', answer: '' }];

            if (Array.isArray(rawValue)) return rawValue;
            
            if (typeof rawValue === 'string') {
                const parsed = JSON.parse(rawValue);
                return Array.isArray(parsed) ? parsed : [{ question: '', answer: '' }];
            }
        } catch (e) {
            console.error("FAQ Parsing Error:", e);
        }
        return [{ question: '', answer: '' }];
    };

    const { data, setData, post, errors, processing } = useForm({
        faqs: getInitialFaqs(),
    });

    const addFaq = () => {
        setData('faqs', [...data.faqs, { question: '', answer: '' }]);
    };

    const removeFaq = (index: number) => {
        const newFaqs = data.faqs.filter((_: any, i: number) => i !== index);
        setData('faqs', newFaqs);
    };

    const handleFieldChange = (index: number, field: string, value: string) => {
        const newFaqs = [...data.faqs];
        newFaqs[index][field] = value;
        setData('faqs', newFaqs);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/settings/business/faqs', {
            preserveScroll: true,
            onSuccess: () => toast.success('FAQs Updated!'),
            onError: () => toast.error("Something went wrong!"),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <MessageCircle className="text-indigo-600" /> FAQs
                </h3>
                <button type="button" onClick={addFaq} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all">
                    <Plus className="w-4 h-4" /> Add FAQ
                </button>
            </div>

            <div className="space-y-6">
                {data.faqs.map((faq: any, index: number) => (
                    <div key={index} className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 relative group">
                        <button type="button" onClick={() => removeFaq(index)} className="absolute -top-2 -right-2 bg-white text-red-500 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all border border-red-50">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 gap-4">
                            <label className="text-sm font-bold text-gray-500">Question</label>
                            <input type="text" placeholder="Question" value={faq.question} onChange={(e) => handleFieldChange(index, 'question', e.target.value)}
                                className="h-12 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 font-bold" 
                            />
                            <label className="text-sm font-bold text-gray-500">Answer</label>
                            <textarea placeholder="Answer" value={faq.answer} onChange={(e) => handleFieldChange(index, 'answer', e.target.value)}
                                className="h-24 w-full rounded-xl border-gray-200 p-3 focus:ring-2 focus:ring-indigo-500" 
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end">
                <button type="submit" disabled={processing} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white ] transition-all active:scale-95 disabled:bg-gray-400">
                    <Save className="h-4 w-4" />{' '} {processing ? 'Saving...' : 'UPDATE FAQS'}
                </button>
            </div>
        </form>
    );
}