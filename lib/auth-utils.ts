export function hasAdminRole(role: string | null | undefined): boolean {
    if (!role) return false;
    return role.split(',').some((value) => value.trim() === 'admin');
}

export function hasPrintShopRole(role: string | null | undefined): boolean {
    if (!role) return false;
    return role.split(',').some((value) => value.trim() === 'print_shop');
}

export function hasCustomerRole(role: string | null | undefined): boolean {
    if (!role) return false;
    return role.split(',').some((value) => value.trim() === 'user');
}

export function getDefaultRouteForRole(role: string | null | undefined): string {
    if (hasAdminRole(role)) return '/';
    if (hasPrintShopRole(role)) return '/print-shop/orders';
    return '/';
}
