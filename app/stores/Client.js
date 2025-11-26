import { defineStore } from 'pinia';
import { toast } from 'vue-sonner';
import { createFormData } from '@/utils/formData';
import { handleRequest } from '@/utils/request';

export const useClientStore = defineStore('client', () => {
    const config = useRuntimeConfig();
    const token = useCookie('access_token');
    const authHeader = { Authorization: `Bearer ${token.value}` };

    const fields = ['name', 'address', 'phone', 'email', 'web', 'logoFile', 'status'];

    const searchById = async (customerId) => {
        const customers = await handleRequest(`${config.public.apiBase}/client`, 'GET', authHeader);
        return customers?.results.find(result => result.id === customerId)?.name || null;
    };

    const fetchAll = (page = 1, search = '', status = 'eksternal') =>
        handleRequest(`${config.public.apiBase}/client/?page=${page}&name=${search}&status=${status}`, 'GET', authHeader);

    const all = () => {
        return handleRequest(`${config.public.apiBase}/client/all`, 'GET', authHeader);
    };

    const update = (id, data) => {
        try {
            const formData = createFormData(data, fields);
            handleRequest(`${config.public.apiBase}/client/${id}/`, 'PUT', authHeader, formData)
                .then(response => response && toast.success('Client updated successfully'));
        } catch (error) {
            toast.error('Failed to update client. Please try again.');
        }
    };

    const add = (data) => {
        try {
            const formData = createFormData(data, fields);
            handleRequest(`${config.public.apiBase}/client/`, 'POST', authHeader, formData)
                .then(response => response && toast.success('Client added successfully'));
        } catch (error) {
            toast.error('Failed to add client. Please try again.');
        }
    };

    const destroy = async (id) => {
        try {
            handleRequest(`${config.public.apiBase}/client/${id}`, 'DELETE', authHeader)
                .then(toast.success('Client delete succcessfully'))
        } catch (error) {
            toast.error('Failed to delete client. Please try again.');
        }
    }

    return {
        searchById,
        fetchAll,
        update,
        destroy,
        all,
        add
    };
});
