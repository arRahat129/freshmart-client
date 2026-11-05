'use server';

import { serverFetch } from "../core/server";

export const getAllUsers = async () => {
    try {
        const response = await serverFetch('/api/users');
        return response;
    } catch (error) {
        console.error("API Error: Failed to fetch users", error);
        throw error;
    }
};

export const getUserById = async (id) => {
    try {
        const response = await serverFetch(`/api/users/${id}`);
        return response;
    } catch (error) {
        console.error(`API Error: Failed to fetch user with id ${id}`, error);
        throw error;
    }
};