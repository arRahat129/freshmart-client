import { clientFetch } from '../core/client';

export const getAllBranches = async () => {
    try {
        return await clientFetch('/api/branches');
    } catch (error) {
        console.error('Failed to fetch branches:', error);
        return { success: false, data: [] };
    }
};

export const getBranchById = async (id) => {
    try {
        return await clientFetch(`/api/branches/${id}`);
    } catch (error) {
        console.error(`Failed to fetch branch ${id}:`, error);
        return { success: false, data: null };
    }
};
