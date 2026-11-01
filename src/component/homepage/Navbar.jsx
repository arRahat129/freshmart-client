'use client';

import React from 'react';
import logo_png from '@/assets/images/freshmart_logo.jpg';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage, Button } from '@heroui/react';

import { useRouter } from 'next/navigation';
import { signOut, useSession } from '@/lib/auth-client';

const Navbar = () => {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const user = session?.user;

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/auth/login');
                },
            },
        });
    };

    return (
        <header className='flex justify-between items-center w-full px-6 py-4 bg-white border-b border-gray-100 shadow-sm'>
            <div className='w-12 h-12 relative overflow-hidden rounded-full'>
                <Image
                    src={logo_png}
                    alt='FreshMart Logo'
                    fill
                    className='object-cover'
                />
            </div>

            <div className='grow'></div>

            <div className='flex items-center gap-4'>
                {!isPending && user ? (
                    <>
                        <div className='hidden sm:block text-right'>
                            <p className='text-sm font-semibold text-gray-800'>{user.name}</p>
                            <p className='text-xs text-gray-500 capitalize'>{user.role}</p>
                        </div>
                        <Avatar>
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <Button
                            color='danger'
                            variant='flat'
                            onPress={handleLogout}
                        >
                            Logout
                        </Button>
                    </>
                ) : (
                    <Button
                        variant='outline'
                        className={'border border-green-500 rounded-full w-full text-green-500'}
                        onPress={() => router.push('/auth/login')}
                    >
                        Sign In
                    </Button>
                )}
            </div>
        </header>
    );
};

export default Navbar;