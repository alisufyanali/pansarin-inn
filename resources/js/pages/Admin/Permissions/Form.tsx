import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

export interface PermissionFormData {
    name: string;
    guard_name: string;
}

interface PermissionFormProps {
    permission?: PermissionFormData & { id: number };
    isEdit: boolean;
}

export default function PermissionForm({ permission, isEdit }: PermissionFormProps) {
    const { data, setData, post, put, processing, errors } = useForm<PermissionFormData>({
        name: permission?.name || '',
        guard_name: permission?.guard_name || 'web',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEdit && permission) {
            put(`/admin/permissions/${permission.id}`);
        } else {
            post('/admin/permissions');
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isEdit ? 'Edit Permission' : 'Create New Permission'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {isEdit ? 'Update permission details' : 'Add a new permission to the system'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Permission Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Permission Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g., view.products, create.users"
                            className="w-full"
                            required
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Use lowercase letters, numbers, dots, hyphens, and underscores only
                        </p>
                    </div>

                    {/* Guard Name */}
                    <div className="space-y-2">
                        <Label htmlFor="guard_name" className="text-sm font-medium">
                            Guard Name
                        </Label>
                        <Input
                            id="guard_name"
                            type="text"
                            value={data.guard_name}
                            onChange={(e) => setData('guard_name', e.target.value)}
                            placeholder="web"
                            className="w-full"
                        />
                        {errors.guard_name && (
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.guard_name}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Default is "web" - only change if you know what you're doing
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving...' : isEdit ? 'Update Permission' : 'Create Permission'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
