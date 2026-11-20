import { serverFetch } from "../core/server";

export async function searchBranchProductsBySku({ sku = '', branchId = '', cashierId = '' } = {}) {
    try {
        const queryParams = new URLSearchParams();
        if (sku) queryParams.set('sku', String(sku));
        if (branchId) queryParams.set('branchId', String(branchId));
        if (cashierId) queryParams.set('cashierId', String(cashierId));

        const qs = queryParams.toString();
        return await serverFetch(`/api/checkout/products/sku${qs ? `?${qs}` : ''}`);
    } catch (error) {
        console.error('Failed to search branch products by SKU:', error);
        return { success: false, data: [] };
    }
}

export async function getAllReceipts(branchId = '') {
    try {
        const queryParams = new URLSearchParams();
        if (branchId) queryParams.set('branchId', String(branchId));

        const qs = queryParams.toString();
        return await serverFetch(`/api/checkout/receipts${qs ? `?${qs}` : ''}`);
    } catch (error) {
        console.error('Failed to fetch receipts:', error);
        return { success: false, data: [] };
    }
}

export async function getReceiptById(receiptId) {
    try {
        return await serverFetch(`/api/checkout/receipts/${encodeURIComponent(receiptId)}`);
    } catch (error) {
        console.error('Failed to fetch receipt details:', error);
        return { success: false, data: null };
    }
}