import React, { useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Save, FolderTree, Globe, Search, Code } from 'lucide-react';
import FieldError from '@/components/FieldError';
import PageHeader from '@/components/PageHeader';
import { inputClass, cardClass, labelClass, subTextClass, buttonPrimaryClass, buttonSecondaryClass, generateSlug } from '@/utils/formStyles';

type BlogCategory = { id: number; name: string };

export type BlogCategoryFormData = {
  name: string;
  slug: string;
  parent_id: string | number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  schema_markup?: string;
  social_image?: File | null;
  social_description?: string;
};

interface BlogCategoryFormProps {
  blogCategory?: BlogCategoryFormData & { id?: number; social_image?: string };
  parents: BlogCategory[];
  isEdit?: boolean;
}

export default function BlogCategoryForm({ blogCategory, parents, isEdit = false }: BlogCategoryFormProps) {
  const { data, setData, errors, post, put, processing } = useForm<BlogCategoryFormData>({
    name: blogCategory?.name || '',
    slug: blogCategory?.slug || '',
    parent_id: blogCategory?.parent_id || '',
    meta_title: blogCategory?.meta_title || '',
    meta_description: blogCategory?.meta_description || '',
    meta_keywords: blogCategory?.meta_keywords || '',
    schema_markup: blogCategory?.schema_markup || '',
    social_image: null,
    social_description: blogCategory?.social_description || '',
  });

  useEffect(() => {
    if (!isEdit && data.name) {
      setData('slug', generateSlug(data.name));
    }
  }, [data.name, isEdit]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isEdit && blogCategory?.id) {
      put(`/admin/blogcategories/${blogCategory.id}`);
    } else {
      post('/admin/blogcategories');
    }
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <PageHeader
        title={isEdit ? 'Edit Category' : 'New Category'}
        backUrl="/admin/blogcategories"
      />

      {(errors as any).error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400">
          {(errors as any).error}
        </div>
      )}

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-4">
                <FolderTree className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Category Details</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Category Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    className={inputClass(errors.name)}
                    placeholder="e.g., Health & Wellness"
                    required
                  />
                  <FieldError message={errors.name} />
                </div>

                <div>
                  <label className={labelClass}>Slug <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={data.slug}
                    onChange={e => setData('slug', e.target.value)}
                    className={inputClass(errors.slug)}
                    placeholder="health-wellness"
                    required
                  />
                  <p className={subTextClass}>Auto-generated from name. Use lowercase letters, numbers, and hyphens only.</p>
                  <FieldError message={errors.slug} />
                </div>

                <div>
                  <label className={labelClass}>Parent Category</label>
                  <select
                    value={data.parent_id}
                    onChange={e => setData('parent_id', e.target.value)}
                    className={inputClass(errors.parent_id)}
                  >
                    <option value="">None (Main Category)</option>
                    {parents.map(parent => (
                      <option key={parent.id} value={parent.id}>{parent.name}</option>
                    ))}
                  </select>
                  <FieldError message={errors.parent_id} />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Social Media</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Social Image</label>
                  {isEdit && blogCategory?.social_image && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current image:</p>
                      <img
                        src={`/storage/${blogCategory.social_image}`}
                        alt="Current social image"
                        className="h-24 rounded-lg border border-gray-200 dark:border-gray-700 object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setData('social_image', e.target.files?.[0] || null)}
                    className={inputClass(errors.social_image)}
                  />
                  {isEdit && (
                    <p className={subTextClass}>Leave empty to keep the current image.</p>
                  )}
                  <FieldError message={errors.social_image} />
                </div>

                <div>
                  <label className={labelClass}>Social Description <span className="text-xs text-gray-500 dark:text-gray-400">(max 300)</span></label>
                  <textarea
                    value={data.social_description}
                    onChange={e => setData('social_description', e.target.value)}
                    maxLength={300}
                    rows={2}
                    className={inputClass(errors.social_description) + ' text-sm'}
                    placeholder="Social media description"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <FieldError message={errors.social_description} />
                    <span className={subTextClass + ' ml-auto'}>{data.social_description?.length || 0}/300</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">SEO Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Meta Title <span className="text-xs text-gray-500 dark:text-gray-400">(max 60)</span></label>
                  <input
                    type="text"
                    value={data.meta_title}
                    onChange={e => setData('meta_title', e.target.value)}
                    maxLength={60}
                    className={inputClass(errors.meta_title) + ' text-sm'}
                    placeholder="SEO optimized title"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <FieldError message={errors.meta_title} />
                    <span className={subTextClass + ' ml-auto'}>{data.meta_title?.length || 0}/60</span>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Meta Description <span className="text-xs text-gray-500 dark:text-gray-400">(max 160)</span></label>
                  <textarea
                    value={data.meta_description}
                    onChange={e => setData('meta_description', e.target.value)}
                    maxLength={160}
                    rows={2}
                    className={inputClass(errors.meta_description) + ' text-sm'}
                    placeholder="Brief description"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <FieldError message={errors.meta_description} />
                    <span className={subTextClass + ' ml-auto'}>{data.meta_description?.length || 0}/160</span>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Keywords</label>
                  <input
                    type="text"
                    value={data.meta_keywords}
                    onChange={e => setData('meta_keywords', e.target.value)}
                    className={inputClass(errors.meta_keywords) + ' text-sm'}
                    placeholder="health, wellness, herbs"
                  />
                  <FieldError message={errors.meta_keywords} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Schema Markup</label>
                  </div>
                  <textarea
                    value={data.schema_markup}
                    onChange={e => setData('schema_markup', e.target.value)}
                    rows={4}
                    className={inputClass(errors.schema_markup) + ' text-sm font-mono'}
                    placeholder='{"@context": "https://schema.org", ...}'
                  />
                  <FieldError message={errors.schema_markup} />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="space-y-3">
                <button type="submit" disabled={processing} className={buttonPrimaryClass}>
                  <Save className="w-4 h-4" />
                  {processing ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
                </button>

                <Link href="/admin/blogcategories" className={buttonSecondaryClass}>Cancel</Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}