'use server';

import { serverMutation } from "../core/server";

export async function actionCreateMainProduct(payload) {
    try {
        return await serverMutation('/api/products/main', payload, 'POST');
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function actionUpdateMainProduct(productId, payload) {
    try {
        return await serverMutation(`/api/products/main/${productId}`, payload, 'PUT');
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function actionDeleteMainProduct(productId) {
    try {
        return await serverMutation(`/api/products/main/${productId}`, null, 'DELETE');
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function actionCreateCategory(payload) {
    try {
        return await serverMutation('/api/catalog/categories', payload, 'POST');
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function actionDeleteCategory(categoryId) {
    try {
        return await serverMutation(`/api/catalog/categories/${categoryId}`, null, 'DELETE');
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function actionCreateVariantAttribute(payload) {
    try {
        return await serverMutation('/api/catalog/attributes', payload, 'POST');
    } catch (error) {
        return { success: false, message: error.message };
    }
}

export async function actionDeleteVariantAttribute(attributeId) {
    try {
        return await serverMutation(`/api/catalog/attributes/${attributeId}`, null, 'DELETE');
    } catch (error) {
        return { success: false, message: error.message };
    }
}