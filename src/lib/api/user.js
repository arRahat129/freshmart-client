import { clientFetch } from '../core/client';

export const getAllUsers = async () => {
    try {
        return await clientFetch('/api/users');
    } catch (error) {
        console.error('API Error: Failed to fetch users', error);
        throw error;
    }
};

export const getUserById = async (id) => {
    try {
        return await clientFetch(`/api/users/${id}`);
    } catch (error) {
        console.error(`API Error: Failed to fetch user ${id}`, error);
        throw error;
    }
};
