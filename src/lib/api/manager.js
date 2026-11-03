'use server';

import { serverFetch } from "../core/server";

export const getAllManagers = async () => {
    try {
        const response = await serverFetch('/api/users');
        return response;
    } catch (error) {
        console.error("API Error: Failed to fetch managers", error);
        throw error;
    }
};