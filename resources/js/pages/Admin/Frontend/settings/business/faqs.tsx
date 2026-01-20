import { useForm } from '@inertiajs/react';
import { Save, MessageCircle, Plus, Trash2 } from 'lucide-react';
import toast from "react-hot-toast";

export default function FaqsTab({ settings }: { settings: any }) {
    // Parse existing FAQs or start with an empty array
    const existingFaqs = settings.faqs?.value ? 
        (typeof settings.faqs.value === 'string' ? JSON.parse(settings.faqs.value) : settings.faqs.value) 
        : [{ question: '', answer: '' }];

    const { data, setData, post, processing } = useForm({
        faqs: existingFaqs,
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
        post((window as any).route('admin.business-settings.updateFaqs'), {
            onSuccess: () => toast.success('Business FAQs Updated!')
        });
    };

    return (
        <form onSubmit={submit} className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-3">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <MessageCircle className="text-indigo-600" /> Business FAQs
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
                            <input 
                                type="text" 
                                placeholder="Question" 
                                value={faq.question} 
                                onChange={(e) => handleFieldChange(index, 'question', e.target.value)}
                                className="h-12 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 font-bold" 
                            />
                            <textarea 
                                placeholder="Answer" 
                                value={faq.answer} 
                                onChange={(e) => handleFieldChange(index, 'answer', e.target.value)}
                                className="h-24 w-full rounded-xl border-gray-200 p-3 focus:ring-2 focus:ring-indigo-500" 
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="pt-4 flex justify-end">
                <button disabled={processing} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-lg">
                    {processing ? 'SAVING...' : 'UPDATE FAQS'}
                </button>
            </div>
        </form>
    );
}