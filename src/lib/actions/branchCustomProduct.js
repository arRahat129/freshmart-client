'use server';

import { revalidatePath } from 'next/cache';
import { serverMutation } from "../core/server";

export async function actionRequestBranchStock(payload) {
    try {
        return await serverMutation('/api/branch-requests/demand', payload, 'POST');
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function actionUpdateBranchStockDemand(demandId, payload) {
    try {
        return await serverMutation(`/api/branch-requests/demand/${demandId}`, payload, 'PUT');
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function actionDeleteBranchStockDemand(demandId) {
    try {
        return await serverMutation(`/api/branch-requests/demand/${demandId}`, null, 'DELETE');
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function actionReviewStockDemand(demandId, payload) {
    try {
        return await serverMutation(`/api/branch-requests/demand/${demandId}/review`, payload, 'PATCH');
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function actionReturnStockToMain(payload) {
    try {
        return await serverMutation('/api/branch-requests/return', payload, 'POST');
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function actionRequestBranchCustomProduct(requestData) {
    try {
        const result = await serverMutation('/api/branch-requests/requests', requestData, 'POST');
        revalidatePath('/dashboard/products');
        revalidatePath('/dashboard/branch-requests');
        return result;
    } catch (error) {
        console.error("Action Error: Failed to submit custom branch product request", error);
        throw error;
    }
}

export async function actionReviewBranchCustomProductRequest(requestId, reviewData) {
    try {
        const result = await serverMutation(`/api/branch-requests/requests/${requestId}/review`, reviewData, 'PATCH');
        revalidatePath('/dashboard/products');
        revalidatePath('/dashboard/branch-requests');
        return result;
    } catch (error) {
        console.error(`Action Error: Failed to review request ${requestId}`, error);
        throw error;
    }
}