import { usePage } from '@inertiajs/react';

// Hook: useCan(permission) -> boolean
// Handles Inertia lazy props and absent auth safely.
export function useCan(permission: string): boolean {
    const props = usePage().props as any;
    const auth = props?.auth ?? {};

    // auth.permission may come as an array or a lazy function (Inertia shared lazy prop)
    let perms: any = auth.permission ?? [];
    if (typeof perms === 'function') {
        try {
            perms = perms();
        } catch (e) {
            perms = [];
        }
    }

    const hasUser = !!auth.user;
    const permArray = Array.isArray(perms) ? perms : [];

    return hasUser && permArray.includes(permission);
}

// Backwards compat: export a simple wrapper named `can` that should only be used inside components (it calls the hook).
export const can = (permission: string) => useCan(permission);