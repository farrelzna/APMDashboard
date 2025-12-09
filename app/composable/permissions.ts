export const useRoles = () => useState<string[]>('roles', () => []);
export const usePermissions = () => useState<string[]>('permissions', () => []);    