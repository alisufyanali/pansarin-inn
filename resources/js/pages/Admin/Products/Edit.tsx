import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import ProductForm, { type ProductFormData } from './Form';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

type Category      = { id: number; name: string };
type Attribute     = { id: number; name: string; slug: string; category_id: number; values: any[] };
type HealthConcern = { id: number; name: string };

interface Product extends ProductFormData {
    id: number;
}

interface Props {
    product:        Product;
    categories:     Category[];
    attributes:     Attribute[];
    healthConcerns: HealthConcern[];
}

export default function Edit({ product, categories, attributes, healthConcerns }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products',          href: '/admin/products' },
        { title: `Edit: ${product.name}`, href: '#' },
    ];

    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();

    useEffect(() => {
        if (props.flash?.success) toast.success(props.flash.success);
        if (props.flash?.error)   toast.error(props.flash.error);
    }, [props.flash]);

    // ── Normalize thumbnail/gallery for edit ──────────────────────
    // Convert storage paths to full URLs so preview works
    const normalizedProduct = {
        ...product,
        thumbnail:    typeof product.thumbnail === 'string'
            ? (product.thumbnail.startsWith('http') ? product.thumbnail : `/storage/${product.thumbnail}`)
            : null,
        social_image: typeof product.social_image === 'string'
            ? (product.social_image.startsWith('http') ? product.social_image : `/storage/${product.social_image}`)
            : null,
        gallery: Array.isArray(product.gallery)
            ? product.gallery.map((g: any) =>
                typeof g === 'string' && !g.startsWith('http') ? `/storage/${g}` : g
              )
            : [],
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${product.name}`} />
            {/* errors Inertia se usePage() ke zariye ProductForm ko milte hain automatically */}
            <ProductForm
                product={normalizedProduct}
                categories={categories}
                attributes={attributes}
                healthConcerns={healthConcerns}
                isEdit={true}
            />
        </AppLayout>
    );
}