import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import RichTextEditor from '@/components/RichTextEditor';
import { Save, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Props {
    page?: any;
    isEdit?: boolean;
}

export default function Form({ page, isEdit = false }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        title: page?.title || '',
        content: page?.content || '',
        meta_title: page?.meta_title || '',
        meta_description: page?.meta_description || '',
        status: page?.status || 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        isEdit ? put(route('admin.pages.update', page.id)) : post(route('admin.pages.store'));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <Label>Page Title</Label>
                                <Input 
                                    value={data.title} 
                                    onChange={e => setData('title', e.target.value)} 
                                    placeholder="e.g. Terms & Conditions"
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>
                            <div>
                                <Label className="mb-2 block text-sm font-medium">Page Content</Label>
                                <RichTextEditor value={data.content} onChange={(val) => setData('content', val)} />
                                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-semibold border-b pb-2">SEO Settings (Optional)</h3>
                            <div>
                                <Label>Meta Title</Label>
                                <Input value={data.meta_title} onChange={e => setData('meta_title', e.target.value)} placeholder="Google search title" />
                            </div>
                            <div>
                                <Label>Meta Description</Label>
                                <textarea 
                                    className="w-full mt-2 p-2 border rounded-md dark:bg-gray-800 text-sm min-h-[80px]"
                                    value={data.meta_description} 
                                    onChange={e => setData('meta_description', e.target.value)}
                                    placeholder="Short summary for SEO"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Settings */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <Label>Status</Label>
                                <select 
                                    className="w-full mt-2 p-2 border rounded-md dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value={data.status} 
                                    onChange={e => setData('status', e.target.value)}
                                >
                                    <option value="active">Active (Visible)</option>
                                    <option value="inactive">Draft (Hidden)</option>
                                </select>
                            </div>

                            <Button disabled={processing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
                                <Save className="w-4 h-4 mr-2" /> {isEdit ? 'Update Changes' : 'Publish Page'}
                            </Button>

                            <Link href={route('admin.pages.index')} className="block text-center text-sm text-gray-500 hover:text-indigo-600 mt-4 transition-colors underline">
                                Back to All Pages
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}