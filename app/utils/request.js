import { toast } from 'vue-sonner';

export async function handleRequest(url, method, headers, body = null) {
    try {
        const options = { method, headers };
        if (body) options.body = body;
        return await $fetch(url, options);
    } catch (error) {
        toast.error(`Failed to ${method === 'GET' ? 'fetch' : method === 'POST' ? 'add' : 'update'} client data. Please try again later.`);
        return null;
    }
}
