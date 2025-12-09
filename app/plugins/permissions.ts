// export default defineNuxtPlugin((nuxtApp) => {
//     nuxtApp.vueApp.directive('can', {
//         mounted(el, binding) {
//             const userStore = useUserStore();
//             const permission = binding.value;
            
//             // If no permission required, show element
//             if (!permission) {
//                 return;
//             }
            
//             // Check if user has permission
//             const permissions = userStore.userPermissions || [];
//             const role = (userStore.user as any)?.role;
//             const hasPermission = permissions.includes(permission) || 
//                                 role === 'admin' || 
//                                 role === 'super_admin';
            
//             // Hide element if no permission
//             if (!hasPermission) {
//                 el.style.display = 'none';
//                 // Or completely remove from DOM:
//                 // el.parentNode?.removeChild(el);
//             }
//         },
//         updated(el, binding) {
//             const userStore = useUserStore();
//             const permission = binding.value;
            
//             if (!permission) {
//                 el.style.display = '';
//                 return;
//             }
            
//             const permissions = userStore.userPermissions || [];
//             const role = (userStore.user as any)?.role;
//             const hasPermission = permissions.includes(permission) || 
//                                 role === 'admin' || 
//                                 role === 'super_admin';
            
//             el.style.display = hasPermission ? '' : 'none';
//         }
//     });
