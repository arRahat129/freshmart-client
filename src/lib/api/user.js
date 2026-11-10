const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const getAllUsers = async () => {
    try {
        const res = await fetch(`${baseUrl}/api/users`, {
            cache: 'no-store',
            credentials: 'include'
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Request failed with status ${res.status}`);
        }
        return res.json();
    } catch (error) {
        console.error('API Error: Failed to fetch users', error);
        throw error;
    }
};

export const getUserById = async (id) => {
    try {
        const res = await fetch(`${baseUrl}/api/users/${id}`, {
            cache: 'no-store',
            credentials: 'include'
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `Request failed with status ${res.status}`);
        }
        return res.json();
    } catch (error) {
        console.error(`API Error: Failed to fetch user ${id}`, error);
        throw error;
    }
};
