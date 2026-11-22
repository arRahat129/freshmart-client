import { clientFetch } from '../core/client';

export async function getTopDashboardStats() {
    try {
        return await clientFetch('/api/dashboard/top-stats');
    } catch (error) {
        console.error('Failed to fetch top role dashboard stats:', error);
        return { success: false, data: null };
    }
}

export async function getManagerDashboardStats() {
    try {
        return await clientFetch('/api/dashboard/manager-stats');
    } catch (error) {
        console.error('Failed to fetch manager dashboard stats:', error);
        return { success: false, data: null };
    }
}

export async function getCashierDashboardStats() {
    try {
        return await clientFetch('/api/dashboard/cashier-stats');
    } catch (error) {
        console.error('Failed to fetch cashier dashboard stats:', error);
        return { success: false, data: null };
    }
}
