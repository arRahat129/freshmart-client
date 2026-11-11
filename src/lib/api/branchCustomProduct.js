import { serverFetch } from "../core/server";

export async function getAllBranchStockDemands(branchId = '') {
    try {
        const path = branchId ? `/api/branch-requests/demand?branchId=${branchId}` : '/api/branch-requests/demand';
        return await serverFetch(path);
    } catch (error) {
        console.error('Failed to fetch branch stock demands:', error);
        return { success: false, data: [] };
    }
}

export async function getBranchStockDemandById(demandId) {
    try {
        return await serverFetch(`/api/branch-requests/demand/${demandId}`);
    } catch (error) {
        console.error('Failed to fetch demand details:', error);
        return { success: false, data: null };
    }
}

export async function getAllBranchCustomProductRequests(branchId = '', status = '') {
    try {
        const queryParams = new URLSearchParams();
        if (branchId) queryParams.append('branchId', branchId);
        if (status) queryParams.append('status', status);

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return await serverFetch(`/api/branch-requests/requests${queryString}`);
    } catch (error) {
        console.error('API Error: Failed to fetch branch custom product requests', error);
        throw error;
    }
}

export async function getBranchCustomProductRequestById(requestId) {
    try {
        return await serverFetch(`/api/branch-requests/requests/${requestId}`);
    } catch (error) {
        console.error(`API Error: Failed to fetch custom product request ${requestId}`, error);
        throw error;
    }
}

export async function getBranchExplicitProducts(branchId) {
    try {
        return await serverFetch(`/api/branch-requests/inventory/${branchId}`);
    } catch (error) {
        console.error(`API Error: Failed to fetch explicit products for branch ${branchId}`, error);
        throw error;
    }
}