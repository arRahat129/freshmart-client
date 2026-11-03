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