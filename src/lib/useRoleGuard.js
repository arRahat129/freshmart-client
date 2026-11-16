'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

export function useRoleGuard(allowedRoles, redirectTo = '/forbidden') {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const role = session?.user?.role;

    useEffect(() => {
        if (isPending) return;
        if (!role || !allowedRoles.includes(role)) {
            router.replace(redirectTo);
        }
    }, [isPending, role, allowedRoles, redirectTo, router]);

    const allowed = !isPending && !!role && allowedRoles.includes(role);
    return { isPending, allowed };
}
