import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const isNextRedirect = (error) => {
    if (error && typeof error === 'object') {
        const err = error;
        return !!(
            err.message === 'NEXT_REDIRECT' ||
            (typeof err.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT'))
        );
    }
    return false;
};

const getForwardedCookies = async () => {
    try {
        const h = await nextHeaders();
        return h.get('cookie') || '';
    } catch {
        return '';
    }
};

export const serverFetch = async (path) => {
    try {
        const cookie = await getForwardedCookies();
        const res = await fetch(`${baseUrl}${path}`, {
            cache: 'no-store',
            headers: cookie ? { cookie } : {}
        });

        return await handleStatusCode(res);
    } catch (error) {
        if (isNextRedirect(error)) throw error;
        console.error(`Fetch failure on path [${path}]:`, error);
        throw error;
    }
};

export const serverMutation = async (
    path,
    data,
    method = "POST"
) => {
    try {
        const cookie = await getForwardedCookies();
        const headers = {
            'Content-Type': 'application/json',
            ...(cookie ? { cookie } : {})
        };

        const options = {
            method,
            headers,
        };

        if (data !== undefined && data !== null) {
            options.body = JSON.stringify(data);
        }

        const res = await fetch(`${baseUrl}${path}`, options);

        return await handleStatusCode(res);
    } catch (error) {
        if (isNextRedirect(error)) throw error;
        throw error;
    }
};

export const handleStatusCode = async (res) => {
    if (res.status === 401) redirect('/unauthorized');
    if (res.status === 403) redirect('/forbidden');
    return await res.json();
};
