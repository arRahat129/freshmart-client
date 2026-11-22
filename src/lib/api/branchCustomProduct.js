import { clientFetch } from '../core/client';

export async function getAllBranchStockDemands(branchId = '') {
    try {
        const path = branchId ? `/api/branch-requests/demand?branchId=${branchId}` : '/api/branch-requests/demand';
        return await clientFetch(path);
    } catch (error) {
        console.error('Failed to fetch branch stock demands:', error);
        return { success: false, data: [] };
    }
}

export async function getBranchStockDemandById(demandId) {
    try {
        return await clientFetch(`/api/branch-requests/demand/${demandId}`);
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
        return await clientFetch(`/api/branch-requests/requests${queryString}`);
    } catch (error) {
        console.error('Failed to fetch branch custom product requests:', error);
        return { success: false, data: [] };
    }
}

export async function getBranchCustomProductRequestById(requestId) {
    try {
        return await clientFetch(`/api/branch-requests/requests/${requestId}`);
    } catch (error) {
        console.error(`Failed to fetch custom product request ${requestId}:`, error);
        return { success: false, data: null };
    }
}

export async function getBranchExplicitProducts(branchId) {
    try {
        return await clientFetch(`/api/branch-requests/inventory/${branchId}`);
    } catch (error) {
        console.error(`Failed to fetch explicit products for branch ${branchId}:`, error);
        return { success: false, data: [] };
    }
}

export async function getAllBranchProducts(params = {}) {
    try {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return await clientFetch(`/api/branch-requests/branch-products${queryString}`);
    } catch (error) {
        console.error('Failed to fetch branch products:', error);
        return { success: false, data: [], pagination: {} };
    }
}

export async function getBranchProductById(productId) {
    try {
        return await clientFetch(`/api/branch-requests/branch-products/${productId}`);
    } catch (error) {
        console.error(`Failed to fetch branch product details for ID [${productId}]:`, error);
        return { success: false, data: null };
    }
}
