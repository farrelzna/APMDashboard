import { toast } from 'vue-sonner';
import { defineStore } from 'pinia';
import { handleRequest } from '@/utils/request';
import { filterData } from '@/utils/filterUpdateData';

export const useProjectStore = defineStore('project', () => {
    const config = useRuntimeConfig();
    const token = useCookie('access_token');
    const authHeader = { Authorization: `Bearer ${token.value}` };

    const fields = [
        'year',
        'pid',
        'name',
        'status',
        'customer',
        'end_user',
        'remarks',
        'am',
        'pm',
        'sales',
        'admin_tender',
        'pic',
        'start_date',
        'end_date',
        'term_of_payment',
        'scope_of_work',
        'engineer_eksternal',
        'project_type',
        'po_contract_no',
        'po_contract_date',
        'amount_inc_tax',
        'amount_exc_tax',
        'id',
        'customer_str',
        'pm_str',
        'finances',
        'project_status',
        'engineer',
        'number',
    ];

    const searchById = async (projectId) => {
        const project = await handleRequest(`${config.public.apiBase}/project/${projectId}`, 'GET', authHeader);

        return project || null;
    };

    const fetchAll = (page = 1, search = '') =>
        handleRequest(`${config.public.apiBase}/project/?page=${page}&search=${search}`, 'GET', authHeader);

    const update = async (id, data, defaultItem = null) => {
        try {
            console.log(data)
            // const filteredData = filterData(data, defaultItem, fields, ['finances', 'project_status', 'engineer']);
            const response = await handleRequest(`${config.public.apiBase}/project/${id}/`, 'PUT', authHeader, data);
            toast.success('Project updated successfully');
        } catch (error) {

            toast.error('Failed to update project. Please try again.');
        }
    };

    const add = async (data) => {
        try {
            const response = await handleRequest(`${config.public.apiBase}/project/`, 'POST', authHeader, data);
            toast.success('Project added successfully');
        } catch (error) {
            toast.error('Failed to add project. Please try again.');
        }
    };

    const destroy = async (id) => {
        try {
            const response = await handleRequest(`${config.public.apiBase}/project/${id}`, 'DELETE', authHeader);
            toast.success('Project deleted successfully');
        } catch (error) {
            toast.error('Failed to delete project. Please try again.');
        }
    };

    return {
        searchById,
        fetchAll,
        update,
        add,
        destroy
    };
});
