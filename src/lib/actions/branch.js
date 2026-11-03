'use server';

import { revalidatePath } from 'next/cache';
import { serverMutation } from '../core/server';

export const actionCreateBranch = async (branchData) => {
    try {
        const result = await serverMutation('/api/branches', branchData, 'POST');
        revalidatePath('/dashboard/owner/branches');
        return result;
    } catch (error) {
        console.error("Action Error: Failed to create branch", error);
        throw error;
    }
};

export const actionUpdateBranch = async (id, branchData) => {
    try {
        const result = await serverMutation(`/api/branches/${id}`, branchData, 'PUT');
        revalidatePath('/dashboard/owner/branches');
        return result;
    } catch (error) {
        console.error(`Action Error: Failed to update branch ${id}`, error);
        throw error;
    }
};

export const actionDeleteBranch = async (id) => {
    try {
        const result = await serverMutation(`/api/branches/${id}`, null, 'DELETE');
        revalidatePath('/dashboard/owner/branches');
        return result;
    } catch (error) {
        console.error(`Action Error: Failed to delete branch ${id}`, error);
        throw error;
    }
};