import { serverFetch } from "../core/server";

export async function getAllMainProducts(page = 1, limit = 10) {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });

        return await serverFetch(`/api/products/main?${queryParams.toString()}`);
    } catch (error) {
        console.error('Failed to fetch main products:', error);
        return { success: false, data: [], pagination: null };
    }
}

export async function getMainProductById(productId) {
    try {
        return await serverFetch(`/api/products/main/${productId}`);
    } catch (error) {
        console.error('Failed to fetch product details:', error);
        return { success: false, data: null };
    }
}

export async function getAllCategories() {
    try {
        return await serverFetch('/api/catalog/categories');
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return { success: false, data: [] };
    }
}

export async function getAllVariantAttributes() {
    try {
        return await serverFetch('/api/catalog/attributes');
    } catch (error) {
        console.error('Failed to fetch variant attributes:', error);
        return { success: false, data: [] };
    }
}