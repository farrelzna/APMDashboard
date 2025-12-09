/**
 * Permission Middleware
 * Checks if user has required permission to access the route
 *
 * Usage in pages:
 * definePageMeta({
 *     middleware: ['auth', 'permission'],
 *     permission: 'client.view_client' // or ['perm1', 'perm2']
 * })
 */
export default defineNuxtRouteMiddleware((to) => {
  try {
    // 🔧 DEVELOPMENT BYPASS
    // Set DISABLE_PERMISSIONS=true in .env to bypass all permission checks
    const { bypassPermissions } = useDevConfig();
    if (bypassPermissions) {
      console.warn("DEVELOPMENT MODE: Permission checks DISABLED");
      return; // Allow all access
    }

    const { can, canAny } = usePermissionHelpers();

    // Get required permission from route meta
    const requiredPermission = to.meta.permission as
      | string
      | string[]
      | undefined;

    // No permission required - allow access
    if (!requiredPermission) {
      return;
    }

    // Check permission
    let hasPermission = false;

    if (Array.isArray(requiredPermission)) {
      // User needs ANY of these permissions (OR logic)
      hasPermission = canAny(requiredPermission);
    } else {
      // Single permission check
      hasPermission = can(requiredPermission);
    }

    // Redirect to forbidden page if no permission
    if (!hasPermission) {
      return navigateTo("/403");
    }
  } catch (error) {
    console.error("Permission middleware error:", error);
    // Allow access on error to prevent blocking
    return;
  }
});
