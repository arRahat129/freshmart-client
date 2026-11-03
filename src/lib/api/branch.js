'use server';

import { serverFetch } from "../core/server";

export const getAllBranches = async () => {
    try {
        const response = await serverFetch('/api/branches');
        return response;
    } catch (error) {
        console.error("API Error: Failed to fetch managers", error);
        throw error;
    }
};

export const getBranchById = async (id) => {
    try {
        const response = await serverFetch(`/api/branches/${id}`);
        return response;
    } catch (error) {
        console.error(`API Error: Failed to fetch branch with id ${id}`, error);
        throw error;
    }
};