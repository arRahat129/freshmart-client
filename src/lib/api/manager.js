import { clientFetch } from '../core/client';

export const getAllManagers = async () => {
    try {
        return await clientFetch('/api/users');
    } catch (error) {
        console.error('Failed to fetch managers:', error);
        return { success: false, data: [] };
    }
};
