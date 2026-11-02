'use client';

import { useSession } from '@/lib/auth-client';
import React from 'react';

const OwnerDashboardHome = () => {
    const { data: session } = useSession();
    const user = session?.user;
    const userRole = user?.role;

    return userRole === 'owner' ? (
        <div>
            OwnerDashboardHome
        </div>
    ) : null;
};

export default OwnerDashboardHome;