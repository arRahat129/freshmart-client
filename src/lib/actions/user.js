'use server';

import { revalidatePath } from 'next/cache';
import { serverMutation } from '../core/server';

export const actionCreateUser = async (userData) => {
    try {
        const result = await serverMutation('/api/users', userData, 'POST');
        revalidatePath('/dashboard/owner/users');
        return result;
    } catch (error) {
        console.error("Action Error: Failed to create user", error);
        throw error;
    }
};

export const actionUpdateUser = async (id, userData) => {
    try {
        const result = await serverMutation(`/api/users/${id}`, userData, 'PUT');
        revalidatePath('/dashboard/owner/users');
        return result;
    } catch (error) {
        console.error(`Action Error: Failed to update user ${id}`, error);
        throw error;
    }
};

export const actionUpdateUserRole = async (id, roleData) => {
    try {
        const result = await serverMutation(`/api/users/${id}/role`, roleData, 'PATCH');
        revalidatePath('/dashboard/owner/users');
        return result;
    } catch (error) {
        console.error(`Action Error: Failed to update role for user ${id}`, error);
        throw error;
    }
};

export const actionDeleteUser = async (id, deletedByData) => {
    try {
        const result = await serverMutation(`/api/users/${id}`, deletedByData, 'DELETE');
        revalidatePath('/dashboard/owner/users');
        return result;
    } catch (error) {
        console.error(`Action Error: Failed to delete user ${id}`, error);
        throw error;
    }
};