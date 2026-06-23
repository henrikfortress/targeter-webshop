export function hasAdminRole(role: string | null | undefined): boolean {
    if (!role) return false;
    return role.split(',').some((value) => value.trim() === 'admin');
}
