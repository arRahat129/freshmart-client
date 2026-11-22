import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: typeof window !== 'undefined'
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'),
    fetchOptions: {
        credentials: 'include',
    },
});

export const { signIn, signUp, signOut, useSession } = authClient;
