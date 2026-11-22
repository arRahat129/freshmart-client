'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

export function useRoleGuard(allowedRoles, redirectTo = '/forbidden') {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const role = session?.user?.role?.toLowerCase();

    const normalizedAllowed = useMemo(
        () => allowedRoles.map((r) => r.toLowerCase()),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [allowedRoles.join(',')]
    );

    useEffect(() => {
        if (isPending) return;
        if (!role || !normalizedAllowed.includes(role)) {
            router.replace(redirectTo);
        }
    }, [isPending, role, normalizedAllowed, redirectTo, router]);

    const allowed = !isPending && !!role && normalizedAllowed.includes(role);
    return { isPending, allowed };
}
