import { toast } from 'vue-sonner';

export const useUserStore = defineStore('user', () => {
    const config = useRuntimeConfig();
    const user = useCookie('user');
    const token = useCookie('access_token');
    const userGroupPermissions = useRoles();
    const userPermissions = usePermissions();

    async function login(username, password) {
        if (!username || !password) {
            toast.error('Username and Password are required.');
            return false;
        }
        try {
            // Using proxy (same-origin) path via routeRules to avoid CORS
            const endpoint = config.public.apiBase + '/auth/token/';
            const data = await $fetch(endpoint, {
                method: 'POST',
                body: { username, password }
            });

            if (data?.access) {
                token.value = data.access;
                await fetchUser();
                toast.success(`Welcome back ${user.value?.full_name || ''}`);
                return true;
            }
            toast.error('Login failed');
            return false;
        } catch (error) {
            let message = 'Failed to log in. Please try again later.';
            const err = error;
            if (err?.response?._data) {
                const d = err.response._data;
                if (typeof d === 'string') message = d;
                else if (d?.detail) message = d.detail;
                else if (typeof d === 'object') {
                    const combined = Object.entries(d)
                      .map(([k,v]) => `${k}: ${Array.isArray(v)? v.join(', ') : v}`)
                      .join('; ');
                    if (combined) message = combined;
                }
            } else if (err?.message) {
                message = err.message;
            }
            toast.error(message);
            return false;
        }
    }

    function logout() {
        token.value = ''
        user.value = ''
        userGroupPermissions.value = ''
        userPermissions.value = ''
        navigateTo('/auth/login')
        toast.success('Logged out successfully')
        window.location.reload()
    }

    async function fetchUser() {
        try {
            const data = await $fetch(config.public.apiBase + '/userprofile/me/', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token.value}`
                }
            });
            if (data.status === "success") {
                userGroupPermissions.value = data.data.groups;
                userPermissions.value = data.data.permissions;
                user.value = {
                    full_name: data.data.full_name,
                    role: data.data.role,
                    email: data.data.email,
                    photo: data.data.photo ? config.public.apiMedia + '/media/' + data.data.photo : '/images/profile/user.png'
                };
            } else {
                toast.error("Failed to fetch user data");
            }
        } catch (error) {
            toast.error("Failed to fetch user data. Please try again later.");
        }
    }

    async function getAll() {
        try {
            const response = await fetch(`${config.public.apiBase}/userprofile/all`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token.value}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users data.');
            }

            const data = await response.json();
            return data;

        } catch (error) {
            toast.error('Failed to fetch users data. Please try again later.');
            return null;
        }
    }

    async function refreshToken() {
        try {
            const data = await $fetch(config.public.apiBase + '/auth/token/refresh/', {
                method: 'POST',
                body: {}
            });
            user.value = data;
        } catch (error) {
            toast.error("Failed to refresh token. Please log in again.");
        }
    }

    async function getUsers(role = '', status = '', options = {}) {
        const {
            page = 1,
            itemsPerPage = 10,
            sortBy = [], // [{ key: 'name', order: 'asc' }]
            search = '',
        } = options;
        const config = useRuntimeConfig(); // Ensure config is accessible
        const token = useCookie('access_token'); // Ensure token is accessible


        try {
            const queryParams = new URLSearchParams();
            queryParams.append('page', page.toString());
            queryParams.append('page_size', itemsPerPage.toString());
            if (search) queryParams.append('search', search);
            if (role) queryParams.append('role', role);
            if (status) queryParams.append('status', status);

            if (sortBy.length > 0) {
                const ordering = sortBy.map(s => (s.order === 'desc' ? '-' : '') + s.key).join(',');
                if (ordering) queryParams.append('ordering', ordering);
            }

            const response = await $fetch(config.public.apiBase + `/userprofile/?${queryParams.toString()}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token.value}` }
            });

            if (response && Array.isArray(response.results)) {
                response.results = response.results.map(user => ({
                    ...user,
                    full_name: [user.first_name, user.last_name].filter(Boolean).join(' ')
                }));
            }

            return {
                items: response.results || [],
                totalItems: response.count || 0,
            };

        } catch (error) {
            let errorMessage = "Failed to fetch users.";
            if (error.response && error.response._data && error.response._data.detail) {
                errorMessage = error.response._data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
            return { items: [], totalItems: 0 }; // Return empty on error
        }
    }

    async function addUser(userData) { // userData is expected to have first_name, last_name
        const config = useRuntimeConfig();
        const token = useCookie('access_token');

        const formData = new FormData();

        // Add new fields: first_name and last_name
        if (userData.first_name) formData.append('first_name', userData.first_name);
        if (userData.last_name) formData.append('last_name', userData.last_name);

        // Existing fields
        if (userData.username) formData.append('username', userData.username);
        if (userData.email) formData.append('email', userData.email);
        if (userData.role) formData.append('role', userData.role);
        if (userData.password) formData.append('password', userData.password); // Only for new users

        // Add is_active and is_staff as true
        formData.append('is_active', 'true');
        formData.append('is_staff', 'true');

        if (userData.photoFile instanceof File) {
            formData.append('photo', userData.photoFile, userData.photoFile.name);
        }

        try {
            const response = await $fetch(config.public.apiBase + '/userprofile/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token.value}`,
                    // Content-Type for FormData is set automatically by the browser
                },
                body: formData,
            });
            toast.success('User created successfully!');
            return response;
        } catch (error) {
            console.error("Add user error raw:", error.response?._data || error);
            let errorMessage = 'Failed to create user.';
            if (error.response && error.response._data) {
                const data = error.response._data;
                if (data.detail) {
                    errorMessage = data.detail;
                } else if (typeof data === 'object') { // More generic error handling
                    const fieldErrors = Object.entries(data)
                        .map(([key, value]) => {
                            const message = Array.isArray(value) ? value.join(', ') : String(value);
                            // Capitalize key for better display
                            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            return `${formattedKey}: ${message}`;
                        })
                        .join('; ');
                    if (fieldErrors) errorMessage = fieldErrors;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
            throw error;
        }
    }

    async function updateUser(userId, userData) { // userData is expected to have first_name, last_name
        const config = useRuntimeConfig();
        const token = useCookie('access_token');

        const formData = new FormData();

        // Add new fields: first_name and last_name if they exist in userData (for PATCH)
        if (userData.hasOwnProperty('first_name')) formData.append('first_name', userData.first_name);
        if (userData.hasOwnProperty('last_name')) formData.append('last_name', userData.last_name);

        // Existing fields
        if (userData.hasOwnProperty('username')) formData.append('username', userData.username);
        if (userData.hasOwnProperty('email')) formData.append('email', userData.email);
        if (userData.hasOwnProperty('role')) formData.append('role', userData.role);

        // Add is_active and is_staff as true
        formData.append('is_active', 'true');
        formData.append('is_staff', 'true');

        if (userData.photoFile && userData.photoFile instanceof File) {
            formData.append('photo', userData.photoFile, userData.photoFile.name);
        }
         // If photoFile is not a new File, 'photo' is not appended,
         // implying no change to the photo for PATCH.

        try {
            const response = await $fetch(`${config.public.apiBase}/userprofile/${userId}/`, {
                method: 'PATCH', // Or PUT, depending on your API. PATCH is for partial updates.
                headers: {
                    Authorization: `Bearer ${token.value}`,
                    // Content-Type for FormData is set automatically
                },
                body: formData,
            });
            toast.success('User updated successfully!');
            return response;
        } catch (error) {
            console.error("Update user error raw:", error.response?._data || error);
            let errorMessage = 'Failed to update user.';
            if (error.response && error.response._data) {
                const data = error.response._data;
                if (typeof data.detail === 'string') {
                    errorMessage = data.detail;
                } else if (typeof data === 'object') { // More generic error handling
                    const fieldErrors = Object.entries(data)
                        .map(([key, value]) => {
                            const message = Array.isArray(value) ? value.join(', ') : String(value);
                            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            return `${formattedKey}: ${message}`;
                        })
                        .join('; ');
                    if (fieldErrors) errorMessage = fieldErrors;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
            throw error;
        }
    }
    async function deleteUser(userId) {
        const config = useRuntimeConfig();
        const token = useCookie('access_token');
        try {
            await $fetch(config.public.apiBase + `/userprofile/${userId}/`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token.value}` },
            });
            toast.success('User deleted successfully!');
            return true;
        } catch (error) {
            toast.error(error.response?._data?.detail || 'Failed to delete user.');
            throw error;
        }
    }

    return {
        user,
        token,
        fetchUser,
        userGroupPermissions,
        userPermissions,
        login,
        logout,
        refreshToken,
        getUsers,
        getAll,
        addUser,
        updateUser,
        deleteUser
    };
});
