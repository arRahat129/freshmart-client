'use server';

import { revalidatePath } from "next/cache";
import { serverMutation } from "../core/server";

export async function actionCreateCheckout(payload) {
    try {
        const res = await serverMutation('/api/checkout', payload, 'POST');
        if (res?.success) {
            revalidatePath('/dashboard/pos');
            revalidatePath('/dashboard/receipts');
            revalidatePath('/dashboard/branch-stock');
        }
        return res;
    } catch (error) {
        return { success: false, message: error.message };
    }
}